namespace Sera.Application.Usecase
{
    public class GetAllBUHandler : BaseHandler,
        IRequestHandler<GetAllBURequest, Response<IEnumerable<GetAllBUResponse>>>
    {
        public GetAllBUHandler(IHttpContextAccessor httpContext, IDbContext dbContext) :
            base(httpContext, dbContext)
        { }

        public async Task<Response<IEnumerable<GetAllBUResponse>>> Handle(
            GetAllBURequest request, CancellationToken cancellationToken)
        {
            var response = new Response<IEnumerable<GetAllBUResponse>>();

            IQueryable<SQL.BusinessUnit> query = null;

            query = dbContext.BusinessUnit
                             .AsNoTracking()
                             .Where(x => x.status == (int)EventStatus.COMPLETED);

            var domain = await query.Select(x => new FindBUResponse()
            {
                businessUnitId = x.businessUnitId,
                businessUnitCode = x.businessUnitCode,
                businessUnitName = x.businessUnitName,
                companyId = x.companyId,
                companyCode = x.Company.companyCode,
                companyName = x.Company.companyName,
                sapIntegrated = x.sapIntegrated,
            }).ToListAsync(cancellationToken);

            if (domain.IsEmpty())
            {
                return response.Fail(TransactionId, Message.NotFound(AppConst.BUSINESS_UNIT),
                                     request.page, request.row, 0, new List<GetAllBUResponse>());
            }

            //DEFAULT ORDER AND SORT (ASCENDING BY BUSINESS UNIT NAME)
            domain = domain.OrderBy(x => x.businessUnitName).ToList();

            if (request.orderBy == Order.ASC &&
                request.sortBy == SortBussinesUnit.businessUnitName)
            {
                domain = domain.OrderBy(x => x.businessUnitName).ToList();
            }
            if (request.orderBy == Order.DESC &&
                request.sortBy == SortBussinesUnit.businessUnitName)
            {
                domain = domain.OrderByDescending(x => x.businessUnitName).ToList();
            }

            if (request.orderBy == Order.ASC &&
              request.sortBy == SortBussinesUnit.businessUnitCode)
            {
                domain = domain.OrderBy(x => x.businessUnitCode).ToList();
            }
            if (request.orderBy == Order.DESC &&
                request.sortBy == SortBussinesUnit.businessUnitCode)
            {
                domain = domain.OrderByDescending(x => x.businessUnitCode).ToList();
            }

            var total = domain.Count;

            request.row = request.row > 0 ? request.row : 10;
            request.page = request.page > 0 ? request.page : 1;

            var maxPage = Math.Ceiling((decimal)total / (decimal)request.row);

            int nextPage = 0;

            if (request.page + 1 > maxPage)
            {
                nextPage = 0;
            }
            else
            {
                nextPage = request.page + 1;
            }

            domain = domain.Skip((request.page - 1) * request.row)
                           .Take(request.row)
                           .ToList();

            var data = domain.Adapt<IEnumerable<GetAllBUResponse>>();
            return response.Success(TransactionId, Message.Found(AppConst.BUSINESS_UNIT),
                                    request.page, nextPage, request.row, total, data);

        }
    }
}