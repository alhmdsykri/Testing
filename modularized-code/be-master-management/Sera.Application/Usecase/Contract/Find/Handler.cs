namespace Sera.Application.Usecase
{
    public class FindContractHandler : BaseHandler,
        IRequestHandler<FindContractsRequest, Response<IEnumerable<FindContractsResponse>>>
    {
        public FindContractHandler(IHttpContextAccessor httpContext, IDbContext dbContext) :
            base(httpContext, dbContext)
        { }

        public async Task<Response<IEnumerable<FindContractsResponse>>> Handle(
            FindContractsRequest request, CancellationToken cancellationToken)
        {
            var response = new Response<IEnumerable<FindContractsResponse>>();

            List<FindContractsResponse> data = new();

            IQueryable<SQL.CustomerContract> query = null;

            query = dbContext.CustomerContract
                             .AsNoTracking()
                             .Where(x => DRBAC.businessUnits.Contains(x.businessUnitId) &&
                                         x.customerContractStatus != (int)ContractStatus.EXPIRED &&
                                         x.status == (int)EventStatus.COMPLETED);

            if(request.contractStatus > 0 )
            {
                query = query.AsNoTracking()
                            .Where(x => x.customerContractStatus == request.contractStatus);
            }

            if (request.businessUnitId > 0)
            {
                query = query.AsNoTracking()
                             .Where(x => x.businessUnitId == request.businessUnitId);
            }

            if (!string.IsNullOrWhiteSpace(request.contractNumber))
            {
                query = query.AsNoTracking()
                             .Where(x => EF.Functions.Like(x.contractNumber,
                                                           $"%{request.contractNumber}%"));
            }

            if (!string.IsNullOrWhiteSpace(request.customerCode))
            {
                query = query.AsNoTracking()
                             .Where(x => EF.Functions.Like(x.customer.customerCode,
                                                           $"%{request.customerCode}%"));
            }

            if (!string.IsNullOrWhiteSpace(request.customerName))
            {
                query = query.AsNoTracking()
                             .Where(x => EF.Functions.Like(x.customer.customerName,
                                                           $"%{request.customerName}%"));
            }

            if (request.startDate.HasValue &&
               request.startDate.Value > CommonConst.DEFAULT_MIN_DATE && request.endDate.HasValue && request.endDate.Value > CommonConst.DEFAULT_MIN_DATE)
            {
                query = query.AsNoTracking()
                             .Where(x => x.startDate.Date >= request.startDate.Value || x.endDate.Date <= request.endDate.Value);
            }

            var entity = await query.Select(x => new FindContractsResponse()
            {
                customerContractId = x.customerContractId,
                contractNumber = x.contractNumber,
                customerCode = x.customer.customerCode,
                customerName = x.customer.customerName,
                startDate = x.startDate,
                endDate = x.endDate,
                contractStatus = x.customerContractStatus == (int)ContractStatus.NOT_STARTED ? "Not Started" :
                                 x.customerContractStatus == (int)ContractStatus.ACTIVE ? "Active" :
                                 x.customerContractStatus == (int)ContractStatus.EXPIRING_SOON ? "Expiring in " + EF.Functions.DateDiffDay(DateTime.Now, x.endDate) + " Days" : "",
                lastUpdate = x.modifiedAt
            }).ToListAsync(cancellationToken: cancellationToken);


            if (entity.IsEmpty())
            {
                return response.Fail(TransactionId,
                                     Message.NotFound("Customer contract"),
                                     request.page, request.row, 0, entity);
            }

            //DEFAULT ORDER AND SORT (ASCENDING BY CONTRACT NUMBER)
            entity = entity.DistinctBy(x => x.contractNumber).ToList();
            entity = entity.OrderBy(x => x.customerName).ToList();

            if (request.orderBy == Order.DESC &&
                request.sortBy == SortContracts.contractNumber)
            {
                entity = entity.OrderByDescending(x => x.contractNumber).ToList();
            }

            if (request.orderBy == Order.ASC &&
                request.sortBy == SortContracts.customerName)
            {
                entity = entity.OrderBy(x => x.customerName).ToList();
            }

            if (request.orderBy == Order.DESC &&
                request.sortBy == SortContracts.customerName)
            {
                entity = entity.OrderByDescending(x => x.customerName).ToList();
            }

            var total = entity.Count;

            request.row = request.row > 0 ? request.row : 10;
            request.page = request.page > 0 ? request.page : 1;

            entity = entity.Skip((request.page - 1) * request.row)
                       .Take(request.row)
                       .ToList();

            return response.Success(TransactionId, Message.Found("Customer contract"),
                                    request.page, request.row, total, entity);
        }
    }
}