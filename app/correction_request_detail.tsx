import { CorrectionRequestDetailScreen } from '@/components/CorrectionRequest/CorrectionRequestDetailScreen';
import { useLocalSearchParams } from 'expo-router';

export default function Screen() {
	const { requestId } = useLocalSearchParams<{ requestId: string }>();
	return <CorrectionRequestDetailScreen id={requestId} />;
}
