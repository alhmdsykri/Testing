namespace Sera.Application.Usecase
{
    public class FindCustomerHandler : BaseHandler,
        IRequestHandler<FindCustomerRequest, Response<IEnumerable<FindCustomerResponse>>>
    {
        public FindCustomerHandler(IHttpContextAccessor httpContext, IDbContext dbContext) :
            base(httpContext, dbContext)
        { }

        public async Task<Response<IEnumerable<FindCustomerResponse>>> Handle(
            FindCustomerRequest request, CancellationToken cancellationToken)
        {
            var response = new Response<IEnumerable<FindCustomerResponse>>();

            IQueryable<SQL.CustomerContract>? query;

            query = dbContext.CustomerContract
                             .AsNoTracking()
                             .Include(i => i.customer)
                             .Where(x => DRBAC.businessUnits.Contains(x.businessUnitId) &&
                                         x.status == (int)EventStatus.COMPLETED);

            if (!string.IsNullOrWhiteSpace(request.customerName))
            {
                query = query.AsNoTracking()
                             .Include(i => i.customer)
                             .Where(x => EF.Functions.Like(x.customer.customerName,
                                                           $"%{request.customerName}%"));
            }

            if (!string.IsNullOrWhiteSpace(request.businessUnitCode))
            {
                query = query.AsNoTracking()
                             .Where(x => EF.Functions.Like(x.businessUnitCode,
                                         $"%{request.businessUnitCode}%"));
            }

            if (request.businessUnitId.HasValue)
            {
                query = query.AsNoTracking()
                             .Where(x => x.businessUnitId == request.businessUnitId);
            }

            var entity = await query.Select(s => new FindCustomerResponse()
            {
                customerId = s.customerId,
                customerCode = s.customer.customerCode,
                customerName = s.customer.customerName,
                isBlocked = s.customer.isBlocked,
                businessUnitId = s.businessUnitId,
                businessUnitCode = s.businessUnitCode,
                businessUnitName = s.businessUnitName
            }).Distinct().ToListAsync(cancellationToken: cancellationToken);

            if (entity.IsEmpty())
            {
                return response.Fail(TransactionId, Message.NotFound("Customer"),
                                     request.page, request.row, 0, new List<FindCustomerResponse>());
            }

            //DEFAULT ORDER AND SORT (ASCENDING BY CUSTOMER NAME)
            entity = entity.OrderBy(x => x.customerName).ToList();

            if (request.orderBy == Order.DESC &&
                request.sortBy == SortCustomer.customerName)
            {
                entity = entity.OrderByDescending(x => x.customerName).ToList();
            }

            if (request.orderBy == Order.ASC &&
                request.sortBy == SortCustomer.isBlocked)
            {
                entity = entity.OrderBy(x => x.isBlocked).ToList();
            }

            if (request.orderBy == Order.DESC &&
                request.sortBy == SortCustomer.isBlocked)
            {
                entity = entity.OrderByDescending(x => x.isBlocked).ToList();
            }

            var total = entity.Count;

            request.row = request.row > 0 ? request.row : 10;
            request.page = request.page > 0 ? request.page : 1;

            entity = entity.Skip((request.page - 1) * request.row)
                           .Take(request.row)
                           .ToList();

            return response.Success(TransactionId, Message.Found("Customer"),
                                    request.page, request.row, total, entity);
        }
    }
}
