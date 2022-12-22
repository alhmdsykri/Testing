namespace Sera.Application.Usecase
{
    public class GetContractHandler : BaseHandler,
         IRequestHandler<GetContractRequest, Response<GetContractResponse>>
    {
        public GetContractHandler(IHttpContextAccessor httpContext, IDbContext dbContext)
            : base(httpContext, dbContext)
        { }

        public async Task<Response<GetContractResponse>> Handle(GetContractRequest request,
            CancellationToken cancellationToken)
        {
            Response<GetContractResponse> response = new();

            var domain = await dbContext.CustomerContract
                                        .AsNoTracking()
                                        .Where(x => x.customerContractId == request.contractId &&
                                                    x.status == (int)EventStatus.COMPLETED)
                                        .Select(x => new GetContractResponse()
                                        {
                                            contractNumber = x.contractNumber,
                                            contractStatus = x.customerContractStatus == (int)ContractStatus.NOT_STARTED ? "Not Active" :
                                                             x.customerContractStatus == (int)ContractStatus.ACTIVE ? "Active" :
                                                             x.customerContractStatus == (int)ContractStatus.EXPIRING_SOON ? "Expiring in " + EF.Functions.DateDiffDay(DateTime.Now, x.endDate) + " Days" : "Expired",
                                            customerCode = x.customer.customerCode,
                                            customerName = x.customer.customerName,
                                            businessUnitId = x.businessUnitId,
                                            businessUnitCode = x.businessUnitCode,
                                            businessUnitName = x.businessUnitName,
                                            startDate = x.startDate,
                                            endDate = x.endDate,
                                            isB2B = x.customer.isB2B,
                                            isMonthly = x.isMonthly,
                                            isProject = x.isProject,
                                            isTMS = x.isTMS,
                                            lastUpdate = x.modifiedAt
                                        }).FirstOrDefaultAsync(cancellationToken: cancellationToken);

            if (domain == null)
            {
                return response.Fail(TransactionId, Message.NotFound("Contract"), null);
            }

            return response.Success(TransactionId, Message.Found("Contract"), domain);
        }
    }
}
