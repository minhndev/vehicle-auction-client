export interface RoleUpdateRequest {
  name?: string;
  description?: string;
  active?: boolean;
  permissionIds?: string[];
}

export interface PermissionResponse {
  id?: string;
  groupName?: string;
  name?: string;
  description?: string;
  system?: boolean;
  active?: boolean;
  createdAt?: string;
  updatedAt?: string;
  createdBy?: string;
  updatedBy?: string;
}

export interface RoleResponse {
  id?: string;
  name?: string;
  description?: string;
  system?: boolean;
  active?: boolean;
  permissions?: PermissionResponse[];
  createdAt?: string;
  updatedAt?: string;
  createdBy?: string;
  updatedBy?: string;
  deleted?: boolean;
  deletedAt?: string;
}

export interface ProductRequest {
  categoryId: string;
  name: string;
  brand: string;
  model: string;
  vinNumber: string;
  manufactureYear: string;
  mileage: string;
  startPrice: string;
  imageUrls: string[];
}

export interface ProductImageResponse {
  id?: string;
  url?: string;
  main?: boolean;
  sortOrder?: number;
}

export interface ProductResponse {
  id?: string;
  name?: string;
  brand?: string;
  model?: string;
  vinNumber?: string;
  startPrice?: number;
  status?: string;
  categoryId?: string;
  categoryName?: string;
  createdAt?: string;
  images?: ProductImageResponse[];
}

export interface CategoryRequest {
  name: string;
  description?: string;
}

export interface CategoryResponse {
  id?: string;
  name?: string;
  slug?: string;
  description?: string;
  active?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface RoleRequest {
  name: string;
  description: string;
  permissionIds?: string[];
}

export interface PaymentCreateRequest {
  referenceId?: string;
  targetType?: string;
  amount?: number;
}

export interface PaymentResponse {
  paymentURL?: string;
}

export interface UploadFileResponse {
  url?: string;
}

export interface DepositRequest {
  auctionId: string;
  paymentMethod?: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  confirmPassword: string;
  firstName: string;
  lastName: string;
  identityNumber: string;
  birthdate: string;
  gender: string;
  phoneNumber?: string;
  address?: string;
  avatarURL?: string;
}

export interface AuthResponse {
  accessToken?: string;
  refreshToken?: string;
  tokenType?: string;
}

export interface RefreshTokenRequest {
  refreshToken: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface AuctionRequest {
  productId: string;
  startTime: string;
  endTime: string;
  startPrice: number;
  bidIncrement: number;
  depositAmount: number;
}

export interface AuctionResponse {
  id?: string;
  productId?: string;
  productName?: string;
  startTime?: string;
  endTime?: string;
  actualEndTime?: string;
  startPrice?: number;
  currentPrice?: number;
  bidIncrement?: number;
  depositAmount?: number;
  winnerId?: string;
  version?: number;
  status?: string;
  active?: boolean;
  createdAt?: string;
  updatedAt?: string;
  createdBy?: string;
  updatedBy?: string;
}

export interface CancelAuctionRequest {
  reason: string;
}

export interface BidRequest {
  amount: number;
}

export interface BidResponse {
  id?: string;
  auctionId?: string;
  bidderId?: string;
  amount?: number;
  createdAt?: string;
  isWinning?: boolean;
}

export interface PermissionRequest {
  name: string;
  groupName: string;
  description: string;
}

export interface WatchlistModel {
  id?: string;
  accountId?: string;
  productId?: string;
  createdAt?: string;
}

export interface PageRoleResponse {
  totalElements?: number;
  totalPages?: number;
  first?: boolean;
  last?: boolean;
  size?: number;
  content?: RoleResponse[];
  number?: number;
  sort?: SortObject;
  numberOfElements?: number;
  pageable?: PageableObject;
  empty?: boolean;
}

export interface PageableObject {
  offset?: number;
  sort?: SortObject;
  paged?: boolean;
  pageNumber?: number;
  pageSize?: number;
  unpaged?: boolean;
}

export interface SortObject {
  empty?: boolean;
  sorted?: boolean;
  unsorted?: boolean;
}

export interface PageProductResponse {
  totalElements?: number;
  totalPages?: number;
  first?: boolean;
  last?: boolean;
  size?: number;
  content?: ProductResponse[];
  number?: number;
  sort?: SortObject;
  numberOfElements?: number;
  pageable?: PageableObject;
  empty?: boolean;
}

export interface IpnResponse {
  RspCode?: string;
  Message?: string;
}

export interface OrderResponse {
  id?: string;
  auctionId?: string;
  productName?: string;
  winningPrice?: number;
  depositAmount?: number;
  remainingAmount?: number;
  status?: string;
  createdAt?: string;
  recipientName?: string;
  recipientPhone?: string;
  shippingAddress?: string;
  shippingNote?: string;
}

export interface Pageable {
  page?: number;
  size?: number;
  sort?: string[];
}

export interface PageOrderResponse {
  totalElements?: number;
  totalPages?: number;
  first?: boolean;
  last?: boolean;
  size?: number;
  content?: OrderResponse[];
  number?: number;
  sort?: SortObject;
  numberOfElements?: number;
  pageable?: PageableObject;
  empty?: boolean;
}

export interface NotificationModel {
  id?: string;
  accountId?: string;
  type?: string;
  title?: string;
  content?: string;
  referenceId?: string;
  referenceType?: string;
  readAt?: string;
  createdAt?: string;
  read?: boolean;
}

export interface PageCategoryResponse {
  totalElements?: number;
  totalPages?: number;
  first?: boolean;
  last?: boolean;
  size?: number;
  content?: CategoryResponse[];
  number?: number;
  sort?: SortObject;
  numberOfElements?: number;
  pageable?: PageableObject;
  empty?: boolean;
}

export interface PageAuctionResponse {
  totalElements?: number;
  totalPages?: number;
  first?: boolean;
  last?: boolean;
  size?: number;
  content?: AuctionResponse[];
  number?: number;
  sort?: SortObject;
  numberOfElements?: number;
  pageable?: PageableObject;
  empty?: boolean;
}

