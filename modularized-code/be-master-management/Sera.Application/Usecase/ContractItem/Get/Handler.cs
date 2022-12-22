namespace Sera.Application.Usecase
{
    public class GetContractItemHandler : BaseHandler,
         IRequestHandler<GetContractItemRequest, Response<GetContractItemResponse>>
    {
        public GetContractItemHandler(IHttpContextAccessor httpContext, IDbContext dbContext)
            : base(httpContext, dbContext)
        { }

        public async Task<Response<GetContractItemResponse>> Handle(GetContractItemRequest request,
                                                                    CancellationToken cancellationToken)
        {
            Response<GetContractItemResponse> response = new();

            var domain = await dbContext.CustomerContractItem
                                        .AsNoTracking()
                                        .Where(x => x.customerContractId == request.contractId &&
                                                    x.customerContractItemId == request.contractItemId &&
                                                    x.status == (int)EventStatus.COMPLETED)
                                        .Select(x => new GetContractItemResponse()
                                        {
                                            isB2B = x.CustomerContract.customer.isB2B,
                                            materialCode = x.Material.materialCode,
                                            materialName = x.Material.materialName,
                                            lineItemNumber = x.lineItemNumber,
                                            numberOfDriver = x.numberOfDriver,
                                            quantity = (decimal)x.quantity,
                                            UOMCode = x.UOMCode,
                                            branchCode = x.branchCode,
                                            branchName = x.branchName,
                                            fuel = x.fuel,
                                            tollAndParking = x.tollAndParking,
                                            channelType = x.channelType == "01" ? "TRAC-Hotel" :
                                                          x.channelType == "02" ? "TRAC-Inbound" :
                                                          x.channelType == "03" ? "TRAC-Regular" :
                                                          x.channelType == "04" ? "TRAC-E-Channel" :
                                                          x.channelType == "05" ? "TRAC-Airport" : "",
                                            coverageArea = x.coverageArea == "01" ? "Intown airport" :
                                                           x.coverageArea == "02" ? "Intown non-airport" :
                                                           x.coverageArea == "03" ? "Out of Town < 12 hours" :
                                                           x.coverageArea == "04" ? "Out of Town > 12 hours" : "",
                                            crew = x.crew == "01" ? "No Crew" :
                                                   x.crew == "02" ? "Medium Bus Intown" :
                                                   x.crew == "03" ? "Medium Bus Out of Town" :
                                                   x.crew == "04" ? "Big Bus Intown" :
                                                   x.crew == "05" ? "Big Bus Out of Town" : "",
                                            helperIncluded = x.helperIncluded,
                                            reportIncluded = x.reportIncluded,
                                            UJPIncluded = x.UJPIncluded
                                        }).FirstOrDefaultAsync(cancellationToken: cancellationToken);

            if (domain == null)
            {
                return response.Fail(TransactionId, Message.NotFound("Contract Item"), null);
            }

            return response.Success(TransactionId, Message.Found("Contract Item"), domain);
        }
    }
}
