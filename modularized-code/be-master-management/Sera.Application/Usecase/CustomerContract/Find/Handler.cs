using System.Linq;

namespace Sera.Application.Usecase
{
    public class FindCustomerContractHandler : BaseHandler,
        IRequestHandler<FindCustomerContractRequest, Response<IEnumerable<FindCustomerContractResponse>>>
    {
        public FindCustomerContractHandler(IHttpContextAccessor httpContext, IDbContext dbContext) :
            base(httpContext, dbContext)
        { }

        public async Task<Response<IEnumerable<FindCustomerContractResponse>>> Handle(
            FindCustomerContractRequest request, CancellationToken cancellationToken)
        {
            var response = new Response<IEnumerable<FindCustomerContractResponse>>();
            int total;

            List<int> contractStatus = new();

            IQueryable<SQL.CustomerContract> query = null;

            if (request.status.IsEmpty())
            {
                request.status = CommonConst.DEFAULT_CONTRACT_STATUS;
            }

            var customerContractStatus = request.status.ToList();

            query = dbContext.CustomerContract
                             .AsNoTracking()
                             .Where(x => customerContractStatus.Contains((char)x.customerContractStatus) &&
                                         DRBAC.businessUnits.Contains(x.businessUnitId) &&
                                         x.status == (int)EventStatus.COMPLETED &&
                                         x.customerId == request.customerId);

            if (request.startDate.HasValue &&
                request.startDate.Value > CommonConst.DEFAULT_MIN_DATE)
            {
                query = query.AsNoTracking()
                             .Where(x => x.startDate.Date >= request.startDate.Value);
            }

            if (request.endDate.HasValue &&
                request.endDate.Value > CommonConst.DEFAULT_MIN_DATE)
            {
                query = query.AsNoTracking()
                             .Where(x => x.endDate.Date <= request.endDate.Value);
            }

            var data = await query.Select(x => new FindCustomerContractResponse()
            {
                contractNumber = x.contractNumber,
                customerContractId = x.customerContractId,
                status = x.customerContractStatus == (int)ContractStatus.NOT_STARTED ? "Not Started" :
                         x.customerContractStatus == (int)ContractStatus.ACTIVE ? "Active" :
                         x.customerContractStatus == (int)ContractStatus.EXPIRING_SOON && EF.Functions.DateDiffDay(DateTime.Now, x.endDate) == 1 ? "Expiring in " + EF.Functions.DateDiffDay(DateTime.Now, x.endDate) + " Day" :
                         x.customerContractStatus == (int)ContractStatus.EXPIRING_SOON && EF.Functions.DateDiffDay(DateTime.Now, x.endDate) > 1 ? "Expiring in " + EF.Functions.DateDiffDay(DateTime.Now, x.endDate) + " Days" :
                         x.customerContractStatus == (int)ContractStatus.EXPIRED ? "Expired" : "",
                endDate = x.endDate,
                startDate = x.startDate,
            }).ToListAsync(cancellationToken: cancellationToken);

            if (data.IsEmpty())
            {
                return response.Fail(TransactionId, Message.NotFound("Customer contract"),
                                     request.page, request.row, 0, data);
            }

            data = data.OrderBy(x => request.status).ToList();
            data = data.DistinctBy(x => x.contractNumber).ToList();
            total = data.Count;

            request.row = request.row > 0 ? request.row : 10;
            request.page = request.page > 0 ? request.page : 1;

            data = data.Skip((request.page - 1) * request.row)
                       .Take(request.row)
                       .ToList();

            return response.Success(TransactionId, Message.Found("Customer contract"),
                                    request.page, request.row, total, data);
        }
    }
}