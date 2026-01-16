/**
 * Order Types
 */

export type OrderStatus = 
  | 'pending' 
  | 'rejected' 
  | 'accepted' 
  | 'ready_for_pickup' 
  | 'in_progress' 
  | 'completed' 
  | 'cancelled' 
  | 'ongoing';

export type VisitType = 'incall' | 'outcall';

export interface CreateOrderPayload {
  providerId: string;
  serviceType: string;
  visitType: VisitType;
  price: number;
  transportationCost?: number;
  serviceCharge?: number;
  locationFrom?: string;
  locationTo?: string;
  distance?: number;
  estimatedDeliveryTime?: number;
  roomId?: string;
  notes?: string;
}

export interface CancelOrderPayload {
  reason: string;
}

export interface AssignRiderPayload {
  riderId: string;
}

export interface UpdateOrderLocationPayload {
  locationFrom?: string;
  locationTo?: string;
  distance?: number;
  estimatedDeliveryTime?: number;
}

export interface Order {
  id: string;
  orderId?: string;
  customerId: string;
  providerId: string;
  riderId?: string;
  serviceType: string;
  visitType: VisitType;
  price: number;
  transportationCost: number;
  serviceCharge: number;
  totalAmount: number;
  currency?: string;
  locationFrom?: string;
  locationTo?: string;
  distance?: number;
  estimatedDeliveryTime?: number;
  roomId?: string;
  riderChatRoomId?: string;
  notes?: string;
  status: OrderStatus;
  isPaid?: boolean;
  paidAt?: string | null;
  acceptedAt?: string | null;
  rejectedAt?: string | null;
  readyAt?: string | null;
  startedAt?: string | null;
  completedAt?: string | null;
  cancelledAt?: string | null;
  cancellationReason?: string | null;
  riderAssignedAt?: string | null;
  riderPickedUpAt?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ListOrdersQuery {
  role?: 'customer' | 'provider' | 'both';
  status?: OrderStatus;
  cursor?: string;
  limit?: number;
}
