namespace Sera.Application.Usecase
{
    public class GetVendorContractHandler : BaseHandler,
        IRequestHandler<GetVendorContractRequest, Response<IEnumerable<GetVendorContractResponse>>>
    {
        public GetVendorContractHandler(IHttpContextAccessor httpContext, IDbContext dbContext) :
            base(httpContext, dbContext)
        { }

        public async Task<Response<IEnumerable<GetVendorContractResponse>>> Handle(
            GetVendorContractRequest request, CancellationToken cancellationToken)
        {
            var response = new Response<IEnumerable<GetVendorContractResponse>>();

            IQueryable<SQL.VendorContract> query = null;

            query = dbContext.VendorContract
                            .AsNoTracking()
                            .Where(x => x.vendorId == request.vendorId &&
                                   x.status == (int)EventStatus.COMPLETED);

            var data = await query.Select(x => new GetVendorContractResponse()
            {
                vendorContractId = x.vendorContractId,
                vendorContractNumber = x.vendorContractNumber,
                vendorContractType = x.vendorContractType,
                businessUnitName = x.businessUnitName,
                status = x.vendorContractStatus == (int)ContractStatus.NOT_STARTED ? "Not Started" :
                        x.vendorContractStatus == (int)ContractStatus.ACTIVE ? "Active" :
                        x.vendorContractStatus == (int)ContractStatus.EXPIRING_SOON && EF.Functions.DateDiffDay(DateTime.Now, x.endDate) == 1 ? "Expiring in " + EF.Functions.DateDiffDay(DateTime.Now, x.endDate) + " Day" :
                        x.vendorContractStatus == (int)ContractStatus.EXPIRING_SOON && EF.Functions.DateDiffDay(DateTime.Now, x.endDate) > 1 ? "Expiring in " + EF.Functions.DateDiffDay(DateTime.Now, x.endDate) + " Days" :
                        x.vendorContractStatus == (int)ContractStatus.EXPIRED ? "Expired" : "",
                endDate = x.endDate,
                startDate = x.startDate,
            }).ToListAsync(cancellationToken: cancellationToken);


            if (data.IsEmpty())
            {
                return response.Fail(TransactionId, Message.NotFound("Vendor Contract"), null);
            }

            //DEFAULT ORDER AND SORT (ASCENDING BY VENDOR CONTRACT STATUS)
            data = data.OrderBy(y => CommonConst.DEFAULT_CONTRACT_STATUS).ToList();
            data = data.DistinctBy(y => y.vendorContractNumber).ToList();

            return response.Success(TransactionId, Message.Found("Vendor Contract"), data);
        }
    }
}
