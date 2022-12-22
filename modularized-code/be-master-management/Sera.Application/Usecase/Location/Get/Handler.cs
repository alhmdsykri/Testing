namespace Sera.Application.Usecase
{
    public class GetBranchHandler : BaseHandler,
        IRequestHandler<GetLocationRequest, Response<GetLocationResponse>>
    {
        public GetBranchHandler(IHttpContextAccessor httpContext, IDbContext dbContext)
            : base(httpContext, dbContext)
        { }

        public async Task<Response<GetLocationResponse>> Handle(GetLocationRequest request,
            CancellationToken cancellationToken)
        {
            Response<GetLocationResponse> response = new();

            var domain = await dbContext.Location
                                        .AsNoTracking()
                                        .Include(x => x.customer)
                                        .Include(x => x.locationType)
                                        .Include(x => x.customerContract)
                                        .Include(x => x.vendor)
                                        .Where(x => x.locationId == request.locationId &&
                                                    x.status == (int)EventStatus.COMPLETED)
                                        .Select(x => new GetLocationResponse()
                                        {
                                            LocationId = x.locationId,
                                            LocationName = x.locationName,
                                            LocationTypeId = x.locationTypeId,
                                            LocationTypeCode = x.locationType.locationTypeCode,
                                            LocationTypeName = x.locationType.locationTypeName,
                                            CicoPoolType = x.cicoPoolType,
                                            CicoPoolTypeName = x.cicoPoolType == (int)CicoPoolType.OFFICE ? "Office" : "Customer",
                                            BusinessUnitId = x.businessUnitId,
                                            BusinessUnitCode = x.businessUnitCode,
                                            BusinessUnitName = x.businessUnitName,
                                            BranchId = x.branchId,
                                            BranchCode = x.branchCode,
                                            BranchName = x.branchName,
                                            TimeOffset = x.timeOffset,
                                            StoreCode = x.storeCode,
                                            WorkingHour = x.workingHour,
                                            CustomerId = x.customerId,
                                            CustomerCode = x.customer.customerCode,
                                            CustomerName = x.customer.customerName,
                                            CustomerContractId = x.customerContractId,
                                            ContractNumber = x.customerContract.contractNumber,
                                            ParentLocationId = x.parentLocationId,
                                            VendorId = x.vendorId,
                                            VendorName = x.vendor.vendorName,
                                            Source = x.source,
                                            CreatedAt = x.createdAt,
                                            ModifiedAt = x.modifiedAt,
                                            LocationAddress = x.locationAddress,
                                            Latitude = x.latitude,
                                            Longitude = x.longitude,
                                            Radius = x.radius
                                        }).FirstOrDefaultAsync(cancellationToken: cancellationToken);

            if (domain == null)
            {
                return response.Fail(TransactionId, Message.NotFound("Location"), null);
            }

            return response.Success(TransactionId, Message.Found("Location"), domain);
        }
    }
}