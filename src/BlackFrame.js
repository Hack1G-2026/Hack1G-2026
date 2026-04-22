// components/BlackFrame.js
import { View, Dimensions } from 'react-native';
import Svg, { Rect, Mask } from 'react-native-svg';

const { width, height } = Dimensions.get('window');

export default function BlackFrame() {
    const holeWidth = width * 0.8;
    const holeHeight = width * 0.8;
    const holeX = (width - holeWidth) / 2;
    const holeY = (height - holeHeight) / 2.5;

    return (
        <View style={{ position: 'absolute', width, height }}>
            <Svg width={width} height={height}>
                <Mask id="mask">
                    <Rect x="0" y="0" width={width} height={height} fill="white" />
                    <Rect
                        x={holeX}
                        y={holeY}
                        width={holeWidth}
                        height={holeHeight}
                        rx={24}
                        fill="black"
                    />
                </Mask>

                <Rect
                    x="0"
                    y="0"
                    width={width}
                    height={height}
                    fill="black"
                    mask="url(#mask)"
                />
            </Svg>
        </View>
    );
}