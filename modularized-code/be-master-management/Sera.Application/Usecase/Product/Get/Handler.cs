namespace Sera.Application.Usecase
{
    public class GetProductHandler : BaseHandler, IRequestHandler<GetProductRequest, Response<GetProductResponse>>
    {
        public GetProductHandler(IHttpContextAccessor httpContext, IDbContext dbContext)
            : base(httpContext, dbContext)
        { }

        public async Task<Response<GetProductResponse>> Handle(GetProductRequest request, CancellationToken cancellationToken)
        {
            Response<GetProductResponse> response = new();
            var product = await dbContext.Product
                                         .AsNoTracking()
                                         .Where(x => x.productId == request.productId &&
                                         (x.status == (int)EventStatus.COMPLETED || x.status == (int)EventStatus.DELETED && x.deletedAt > DateTime.Now))
                                         .Select(x => new GetProductResponse()
                                         {
                                             productId = x.productId,
                                             productCode = x.productCode,
                                             productName = x.productName,
                                             businessUnitId = x.businessUnitId,
                                             businessUnitCode = x.businessUnitCode,
                                             businessUnitName = x.businessUnitName,
                                             productTypeId = x.productTypeId,
                                             journeyTypeId = x.journeyTypeId,
                                             isExpedition = x.isExpedition,
                                             expeditionId = x.expeditionId,
                                             isAssignedToVehicle = x.isAssignedToVehicle,
                                             isAssignedToDriver = x.isAssignedToDriver,
                                             driverExpensePreTripId = x.driverExpensePreTripId,
                                             driverExpensePostTripId = x.driverExpensePostTripId,
                                             isReconcilation = x.isReconcilation,
                                             hasProofOfDelivery = x.hasProofOfDelivery,
                                             productStatus = x.productStatus
                                         }).FirstOrDefaultAsync(cancellationToken: cancellationToken);

            if (product == null)
            {
                return response.Fail(TransactionId, Message.NotFound("Product"), null);
            }

            return response.Success(TransactionId, Message.Found("Product"), product);
        }
    }
}