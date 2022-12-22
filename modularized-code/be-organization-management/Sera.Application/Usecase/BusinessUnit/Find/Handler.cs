namespace Sera.Application.Usecase
{
    public class FindBUHandler : BaseHandler,
        IRequestHandler<FindBURequest, Response<IEnumerable<FindBUResponse>>>
    {
        public FindBUHandler(IHttpContextAccessor httpContext, IDbContext dbContext) :
            base(httpContext, dbContext)
        { }

        public async Task<Response<IEnumerable<FindBUResponse>>> Handle(
            FindBURequest request, CancellationToken cancellationToken)
        {
            var response = new Response<IEnumerable<FindBUResponse>>();

            IQueryable<SQL.BusinessUnit> query = null;

            query = dbContext.BusinessUnit
                             .AsNoTracking()
                             .Where(x => DRBAC.businessUnits.Contains(x.businessUnitId) &&
                                         x.status == (int)EventStatus.COMPLETED);

            if (!string.IsNullOrWhiteSpace(request.businessUnitCode))
            {
                query = query.AsNoTracking()
                             .Where(x => EF.Functions.Like(x.businessUnitCode,
                                                           $"%{request.businessUnitCode}%"));
            }

            if (!string.IsNullOrWhiteSpace(request.businessUnitName))
            {
                query = query.AsNoTracking()
                             .Where(x => EF.Functions.Like(x.businessUnitName,
                                                           $"%{request.businessUnitName}%"));
            }

            if (!string.IsNullOrWhiteSpace(request.companyCode))
            {
                query = query.AsNoTracking()
                             .Include(x => x.Company)
                             .Where(x => EF.Functions.Like(x.Company.companyCode,
                                                           $"%{request.companyCode}%"));
            }

            if (!string.IsNullOrWhiteSpace(request.companyName))
            {
                query = query.AsNoTracking()
                             .Include(x => x.Company)
                             .Where(x => EF.Functions.Like(x.Company.companyName,
                                                           $"%{request.companyName}%"));
            }

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
                return response.Fail(TransactionId, Message.NotFound("Bussines Unit"),
                                     request.page, request.row, 0, new List<FindBUResponse>());
            }

            #region BUSSINES UNIT CODE
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

            #endregion

            #region BUSSINES UNIT NAME
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
            #endregion

            #region COMPANY CODE
            if (request.orderBy == Order.ASC &&
                request.sortBy == SortBussinesUnit.companyCode)
            {
                domain = domain.OrderBy(x => x.companyCode).ToList();
            }
            if (request.orderBy == Order.DESC &&
                request.sortBy == SortBussinesUnit.companyCode)
            {
                domain = domain.OrderByDescending(x => x.companyCode).ToList();
            }
            #endregion

            #region COMPANY NAME
            if (request.orderBy == Order.ASC &&
                request.sortBy == SortBussinesUnit.companyName)
            {
                domain = domain.OrderBy(x => x.companyName).ToList();
            }
            if (request.orderBy == Order.DESC &&
                request.sortBy == SortBussinesUnit.companyName)
            {
                domain = domain.OrderByDescending(x => x.companyName).ToList();
            }
            #endregion

            var total = domain.Count;

            request.row = request.row > 0 ? request.row : 10;
            request.page = request.page > 0 ? request.page : 1;

            domain = domain.Skip((request.page - 1) * request.row)
                           .Take(request.row)
                           .ToList();

            return response.Success(TransactionId, Message.Found("Business unit"),
                                    request.page, request.row, total, domain);
        }
    }
}
