import { theme } from '@/assets/theme';

import type { FC } from 'react';
import { StyleSheet, View } from 'react-native';
import Svg, { Polygon } from 'react-native-svg';

const PATTERN_POLYGONS = [
	'0,0 200,120 0,240',
	'200,120 400,0 400,220',
	'200,120 400,220 220,340',
	'0,240 200,120 220,340',
	'0,240 220,340 60,460',
	'220,340 400,220 380,480',
	'220,340 380,480 200,560',
	'60,460 220,340 200,560',
	'60,460 200,560 0,640',
	'200,560 380,480 400,680',
	'0,640 200,560 180,780',
	'200,560 400,680 180,780',
];

export const BackgroundPattern: FC = () => {
	const colors = theme();

	return (
		<View
			accessibilityElementsHidden
			importantForAccessibility='no-hide-descendants'
			pointerEvents='none'
			style={patternStyles.container}
		>
			<Svg
				height='100%'
				preserveAspectRatio='none'
				viewBox='0 0 400 800'
				width='100%'
			>
				{PATTERN_POLYGONS.map((points) => (
					<Polygon
						fill='none'
						key={points}
						points={points}
						stroke={colors.onPrimary}
						strokeWidth={1.2}
					/>
				))}
			</Svg>
		</View>
	);
};

const patternStyles = StyleSheet.create({
	container: {
		position: 'absolute',
		top: 0,
		right: 0,
		bottom: 0,
		left: 0,
		opacity: 0.07,
	},
});
