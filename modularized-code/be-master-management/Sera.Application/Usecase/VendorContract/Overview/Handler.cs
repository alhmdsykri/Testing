namespace Sera.Application.Usecase
{
    public class GetOverviewVendorContractHandler : BaseHandler,
         IRequestHandler<GetOverviewVendorContractRequest, Response<GetOverviewVendorContractResponse>>
    {
        public GetOverviewVendorContractHandler(IHttpContextAccessor httpContext, IDbContext dbContext)
            : base(httpContext, dbContext)
        { }

        public async Task<Response<GetOverviewVendorContractResponse>> Handle(
            GetOverviewVendorContractRequest request, CancellationToken cancellationToken)
        {
            Response<GetOverviewVendorContractResponse> response = new();

            var data = await dbContext.VendorContract
                                      .AsNoTracking()
                                      .Where(x => DRBAC.businessUnits.Contains(x.businessUnitId.Value) &&
                                             x.status == (int)EventStatus.COMPLETED)
                                      .GroupBy(x => x.vendorContractStatus)
                                      .Select(x => new GetOverviewVendorContractResponse()
                                      {
                                          totalVendor = x.Count(),
                                          notStarted = x.Count(x => x.vendorContractStatus == (int)ContractStatus.NOT_STARTED),
                                          activeContract = x.Count(x => x.vendorContractStatus == (int)ContractStatus.ACTIVE),
                                          expiryContract = x.Count(x => x.vendorContractStatus == (int)ContractStatus.EXPIRING_SOON),
                                          expiredContract = x.Count(x => x.vendorContractStatus == (int)ContractStatus.EXPIRED)                                       
                                      })
                                      .ToListAsync(cancellationToken: cancellationToken);
            if (data == null)
            {
                return response.Fail(TransactionId, Message.NotFound("Vendor Contract"), null);
            }

            data.ForEach(x =>
            {
                x.totalVendor = data.Sum(x => x.totalVendor);
                x.notStarted = data.Sum(x => x.notStarted);
                x.activeContract = data.Sum(x => x.activeContract);
                x.expiryContract = data.Sum(x => x.expiryContract);
                x.expiredContract = data.Sum(x => x.expiredContract);
            });

            GetOverviewVendorContractResponse datum = data.FirstOrDefault();

            return response.Success(TransactionId, Message.Found("Vendor Contract"), datum);
        }        
    }
}
