import { Order } from '@/app/types/chat';
import Link from 'next/link';

interface OrderCardProps {
  order: Order;
}

export default function OrderCard({ order }: OrderCardProps) {
  const seller = typeof order.seller === 'string' ? { username: 'Unknown' } : order.seller;
  const buyer = typeof order.buyer === 'string' ? { username: 'Unknown' } : order.buyer;

  return (
    <Link href={`/declutter/purchase/${order._id}`}>
      <div className="p-4 bg-white shadow rounded-lg hover:shadow-md transition">
        <h3 className="text-lg font-semibold text-gray-800">{order?.item?.title}</h3>
        <p className="text-gray-600">Price: ₦{order.price.toLocaleString()}</p>
        <p className="text-gray-600">Seller: {seller?.username}</p>
        <p className="text-gray-600">Buyer: {buyer?.username}</p>
        <p className={`text-sm font-medium capitalize ${
          order?.trackingStatus === 'completed' ? 'text-green-600' :
          order?.trackingStatus === 'refunded' ? 'text-red-600' : 'text-yellow-600'
        }`}>
          Status: {order.trackingStatus}
        </p>
        {order.meetingDetails && (
          <p className="text-gray-500 text-sm">
            Meetup: {order?.meetingDetails.location} at {new Date(order?.meetingDetails.time).toLocaleString()}
          </p>
        )}
      </div>
    </Link>
  );
}