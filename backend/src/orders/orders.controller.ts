import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  Query,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { Role } from '@prisma/client';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { QueryOrdersDto } from './dto/query-orders.dto';
import { Auth } from '../auth/decorators/auth.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@ApiTags('Quản lý Đơn Đặt Khám & Booking')
@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Tạo phiếu đặt khám trực tuyến (Storefront Booking)',
    description:
      'Khách hàng/bệnh nhân đặt lịch khám, hệ thống tự động sinh Mã Phiếu Khám duy nhất (Booking Code), xác thực voucher và tính hoa hồng tạm tính.',
  })
  @ApiResponse({ status: 201, description: 'Đặt khám thành công, trả về thông tin phiếu khám' })
  @ApiResponse({ status: 400, description: 'Thông tin không hợp lệ, vi phạm voucher hoặc ngày khám' })
  @ApiResponse({ status: 404, description: 'Cơ sở y tế hoặc gói khám không tồn tại' })
  async createOrder(@Body() dto: CreateOrderDto) {
    return this.ordersService.createOrder(dto);
  }

  @Get('booking/:bookingCode')
  @ApiOperation({
    summary: 'Tra cứu phiếu khám điện tử theo Booking Code (Công khai)',
    description:
      'Dành cho khách hàng xem lại phiếu khám hoặc Lễ tân tra cứu nhanh mã phiếu khi bệnh nhân đến quầy.',
  })
  @ApiParam({ name: 'bookingCode', example: 'MED-202610-A9X2' })
  @ApiResponse({ status: 200, description: 'Tìm thấy phiếu khám' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy phiếu khám' })
  async getOrderByBookingCode(@Param('bookingCode') bookingCode: string) {
    return this.ordersService.getOrderByBookingCode(bookingCode);
  }

  @Get('my-affiliate-orders')
  @Auth(Role.AFFILIATE_PARTNER, Role.INTERNAL_STAFF, Role.SUPER_ADMIN)
  @ApiOperation({
    summary: 'Danh sách đơn giới thiệu của CTV (Dashboard CTV)',
    description:
      'Xem các đơn khám phát sinh từ voucher/link của CTV, hoa hồng tạm tính và đã duyệt (thông tin bệnh nhân được che bảo mật).',
  })
  @ApiResponse({ status: 200, description: 'Lấy danh sách đơn giới thiệu thành công' })
  async getMyAffiliateOrders(@CurrentUser('id') userId: string) {
    return this.ordersService.getMyAffiliateOrders(userId);
  }

  @Get()
  @Auth(Role.SUPER_ADMIN, Role.BRANCH_RECEPTIONIST, Role.AFFILIATE_PARTNER)
  @ApiOperation({
    summary: 'Danh sách đơn khám (Lễ tân / Admin / CTV)',
    description:
      'Lấy danh sách đơn khám theo bộ lọc. Lễ tân tự động bị giới hạn theo đúng chi nhánh của mình.',
  })
  @ApiResponse({ status: 200, description: 'Lấy danh sách đơn thành công' })
  async getOrders(
    @Query() query: QueryOrdersDto,
    @CurrentUser() currentUser: any,
  ) {
    return this.ordersService.getOrders(query, currentUser);
  }
}
