namespace Sera.Application.Usecase
{
    public class GetOverviewContractHandler : BaseHandler,
         IRequestHandler<GetOverviewContractRequest, Response<GetOverviewContractResponse>>
    {
        public GetOverviewContractHandler(IHttpContextAccessor httpContext, IDbContext dbContext)
            : base(httpContext, dbContext)
        { }

        public async Task<Response<GetOverviewContractResponse>> Handle(
            GetOverviewContractRequest request, CancellationToken cancellationToken)
        {
            Response<GetOverviewContractResponse> response = new();

            var data = await dbContext.CustomerContract.AsNoTracking()
                                      .Where(x => x.businessUnitId == request.businessUnitId &&
                                                  x.customerContractStatus != (int)ContractStatus.EXPIRED &&
                                                  x.status == (int)EventStatus.COMPLETED)
                                      .GroupBy(x => x.customerContractStatus)
                                      .Select(x => new GetOverviewContractResponse()
                                      {
                                          totalVendor = x.Count(),
                                          notStarted = x.Count(x => x.customerContractStatus == (int)ContractStatus.NOT_STARTED),
                                          activeContract = x.Count(x => x.customerContractStatus == (int)ContractStatus.ACTIVE),
                                          expiryContract = x.Count(x => x.customerContractStatus == (int)ContractStatus.EXPIRING_SOON)                                              })
                                      .ToListAsync(cancellationToken: cancellationToken);
            if (data == null)
            {
                return response.Fail(TransactionId, Message.NotFound("Contract"), null);
            }

            data.ForEach(x =>
            {
                x.totalVendor = data.Sum(x => x.totalVendor);
                x.notStarted = data.Sum(x => x.notStarted);
                x.activeContract = data.Sum(x => x.activeContract);
                x.expiryContract = data.Sum(x => x.expiryContract);
            });

            GetOverviewContractResponse datum = data.FirstOrDefault();

            return response.Success(TransactionId, Message.Found("Contract"), datum);
        }        
    }
}
