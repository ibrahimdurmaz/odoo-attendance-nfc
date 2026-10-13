import { getNotificationPageCount } from '@/store/useNotificationStore';
import { useState } from 'react';
import { Pagination } from './Pagination';

export const NotificationsScreen = () => {
	const [page, setPage] = useState(0);
	const pageCount = getNotificationPageCount(notifications.length);
	const currentPage = Math.min(page, pageCount - 1);
	return (
		<>
			{pageCount > 1 ? (
				<Pagination
					onChange={setPage}
					page={currentPage}
					pageCount={pageCount}
				/>
			) : null}
		</>
	);
};
