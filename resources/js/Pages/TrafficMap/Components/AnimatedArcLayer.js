import { CompositeLayer } from '@deck.gl/core';
import {ArcLayer, LineLayer, PathLayer, ScatterplotLayer} from '@deck.gl/layers';

// Generate a path for the animated arc
function generateArcPath(source, target, progress, steps = 60) {
    // Cap progress at 1.0 for position calculation
    const positionProgress = Math.min(progress, 1.0);

    // For a single point at current position
    if (steps === 1) {
        const t = positionProgress;
        const lng = source[0] + (target[0] - source[0]) * t;
        const lat = source[1] + (target[1] - source[1]) * t;
        const arcHeight = Math.sin(Math.PI * t) * 20; // Simulate arc bump
        return [lng, lat, arcHeight];
    }

    // For a trail path
    const path = [];
    const segmentSize = positionProgress / Math.max(1, steps - 1);

    for (let i = 0; i < steps; i++) {
        const t = Math.min(i * segmentSize, positionProgress);
        if (t <= positionProgress) {
            const lng = source[0] + (target[0] - source[0]) * t;
            const lat = source[1] + (target[1] - source[1]) * t;
            const arcHeight = Math.sin(Math.PI * t) * 20; // Simulate arc bump
            path.push([lng, lat, arcHeight]);
        }
    }

    return path;
}

export class AnimatedArcLayer extends CompositeLayer {
    initializeState() {
        this.setState({ progress: 0 });
        this._animate();
    }

    _animate() {
        const animationFrame = requestAnimationFrame(() => {
            // Allow progress to go beyond 1 for fade-out effect, but cap at 1.5
            const animationSpeed = this.props.animationSpeed || 0.01;
            const progress = Math.min(this.state.progress + animationSpeed, 1.5);
            this.setState({ progress });
            this.setNeedsRedraw();

            if (progress < 1.5) {
                this._animate();
            } else {
                // Animation is completely done (including fade-out)
                if (this.props.onComplete) {
                    this.props.onComplete();
                }

                // Reset if loop is enabled
                if (this.props.loop) {
                    this.setState({ progress: 0 });
                    this._animate();
                }
            }
        });

        // Store animation frame reference for cleanup
        this.setState({ animationFrame });
    }

    // Clean up animation when layer is removed
    finalizeState() {
        if (this.state.animationFrame) {
            cancelAnimationFrame(this.state.animationFrame);
        }
    }

    updateState({ changeFlags }) {
        if (changeFlags.dataChanged) {
            this.setState({ progress: 0 });
            this._animate();
        }
    }

    renderLayers() {
        const {
            data,
            getSource,
            getTarget,
            getColor = () => [255, 140, 0],
            getWidth = () => 3,
            showTrail = true,
            showPoint = true,
            trailLength = 0.3, // Length of the trail as a fraction of the total path
            fadeOut = true,    // Whether to fade out the trail as it gets older
            dataTransform
        } = this.props;
        const { progress } = this.state;

        // Ensure we have data to render
        if (!data) {
            console.warn('AnimatedArcLayer: No data provided');
            return null;
        }

        // Apply data transform if provided
        const processedData = dataTransform ? dataTransform(data) : data;

        if (!processedData || !processedData.length) {
            return null;
        }

        const layers = [];

        // Process each data item
        const animatedData = processedData.map(d => {
            // Ensure source and target are valid
            const source = getSource(d);
            const target = getTarget(d);

            if (!source || !target) {
                console.warn('AnimatedArcLayer: Invalid source or target', { source, target, data: d });
                return null;
            }

            // Get the current point along the arc path
            const point = generateArcPath(source, target, progress, 1);

            // Generate trail path if needed
            let trailPath = null;
            if (showTrail) {
                // Calculate the start of the trail based on progress and trailLength
                const trailStart = Math.max(0, progress - trailLength);
                const trailProgress = progress - trailStart;

                // Generate path for the visible part of the trail
                if (trailProgress > 0) {
                    const steps = Math.max(2, Math.floor(trailProgress * 60));
                    trailPath = generateArcPath(source, target, progress, steps);
                }
            }

            return {
                id: d.id || `${source[0]}-${source[1]}-${target[0]}-${target[1]}`,
                source,
                target,
                point,
                trailPath,
                color: getColor(d),
                width: getWidth(d),
                originalData: d
            };
        }).filter(Boolean); // Remove any null entries

        // Add trail paths if enabled
        if (showTrail) {
            animatedData.forEach(d => {
                if (d.trailPath && d.trailPath.length > 1) {
                    layers.push(
                        new PathLayer({
                            id: `${this.id}-trail-${d.id}`,
                            data: [d],
                            getPath: d => d.trailPath,
                            getColor: d => {
                                const color = [...d.color];
                                if (fadeOut) {
                                    // Make the trail fade out at the beginning
                                    color[3] = 255 * (progress < 1 ? 0.8 : 1 - (progress - 1) * 2);
                                }
                                return color;
                            },
                            getWidth: d => d.width,
                            widthUnits: 'pixels',
                            pickable: true,
                            updateTriggers: {
                                getPath: [progress],
                                getColor: [progress]
                            }
                        })
                    );
                }
            });
        }

        // Add moving point if enabled
        if (showPoint && progress < 1.5) { // Hide point after arc fades out
            layers.push(
                new ScatterplotLayer({
                    id: `${this.id}-point`,
                    data: animatedData,
                    getPosition: d => d.point,
                    getColor: d => d.color,
                    getRadius: 4,
                    radiusMinPixels: 3,
                    opacity: progress < 1 ? 1 : Math.max(0, 1 - (progress - 1) * 2), // Fade out with arc
                    pickable: true,
                    updateTriggers: {
                        getPosition: [progress],
                        opacity: [progress]
                    }
                })
            );
        }

        return layers;
    }
}
