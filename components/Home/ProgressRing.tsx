import { theme } from '@/assets/theme';
import { FC, ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';
import Svg, { Circle } from 'react-native-svg';

type ProgressRingProps = {
	progress: number;
	color: string;
	children: ReactNode;
};
const RING_SIZE = 220;
const RING_STROKE = 12;

export const ProgressRing: FC<ProgressRingProps> = ({
	progress,
	color,
	children,
}) => {
	const colors = theme();
	const radius = (RING_SIZE - RING_STROKE) / 2;
	const circumference = 2 * Math.PI * radius;
	const clamped = Math.min(1, Math.max(0, progress));

	return (
		<View style={styles.ring}>
			{/* Yay saat 3 yönünden başlar; -90° çevirince saat 12'den başlar. */}
			<Svg height={RING_SIZE} style={styles.ringSvg} width={RING_SIZE}>
				<Circle
					cx={RING_SIZE / 2}
					cy={RING_SIZE / 2}
					fill='none'
					r={radius}
					stroke={colors.surfaceContainer}
					strokeWidth={RING_STROKE}
				/>
				{clamped > 0 ? (
					<Circle
						cx={RING_SIZE / 2}
						cy={RING_SIZE / 2}
						fill='none'
						r={radius}
						stroke={color}
						strokeDasharray={circumference}
						strokeDashoffset={circumference * (1 - clamped)}
						strokeLinecap='round'
						strokeWidth={RING_STROKE}
					/>
				) : null}
			</Svg>
			<View style={styles.ringContent}>{children}</View>
		</View>
	);
};
const styles = StyleSheet.create({
	ring: {
		width: RING_SIZE,
		height: RING_SIZE,
		alignItems: 'center',
		justifyContent: 'center',
	},
	ringSvg: { transform: [{ rotate: '-90deg' }] },
	ringContent: {
		position: 'absolute',
		top: 0,
		right: 0,
		bottom: 0,
		left: 0,
		alignItems: 'center',
		justifyContent: 'center',
		gap: 4,
	},
});
