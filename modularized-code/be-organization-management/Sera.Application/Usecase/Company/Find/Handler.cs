namespace Sera.Application.Usecase
{
    public class FindCompanyHandler : BaseHandler,
        IRequestHandler<FindCompanyRequest, Response<IEnumerable<FindCompanyResponse>>>
    {
        public FindCompanyHandler(IHttpContextAccessor httpContext, IDbContext dbContext) :
            base(httpContext, dbContext)
        { }

        public async Task<Response<IEnumerable<FindCompanyResponse>>> Handle(
            FindCompanyRequest request, CancellationToken cancellationToken)
        {
            var response = new Response<IEnumerable<FindCompanyResponse>>();

            IQueryable<SQL.Company> query = null;

            query = dbContext.Company
                             .AsNoTracking()
                             .Where(x => DRBAC.companies.Contains(x.companyId) &&
                                         x.status == (int)EventStatus.COMPLETED);

            if (!string.IsNullOrWhiteSpace(request.companyCode))
            {
                query = query.AsNoTracking()
                             .Where(x => EF.Functions.Like(x.companyCode, $"%{request.companyCode}%"));
            }

            if (!string.IsNullOrWhiteSpace(request.companyName))
            {
                query = query.AsNoTracking()
                             .Where(x => EF.Functions.Like(x.companyName, $"%{request.companyName}%"));
            }

            var entity = await query.ToListAsync(cancellationToken);

            if (entity.IsEmpty())
            {
                return response.Fail(TransactionId, Message.NotFound("Company"),
                                     request.page, request.row, 0, new List<FindCompanyResponse>());
            }

            #region FIND PARENT COMPANY
            var parentId = entity.Select(x => x.parentCompanyId).Distinct();
            if (!parentId.IsEmpty())
            {
                var parentCompany = await dbContext.Company
                                                   .AsNoTracking()
                                                   .Where(x => parentId.Contains(x.companyId))
                                                   .ToListAsync(cancellationToken);

                if (!parentCompany.IsEmpty())
                {
                    entity.ForEach(x =>
                    {
                        x.parentCompany = parentCompany.Where(y => y.companyId == x.parentCompanyId)
                                                       .FirstOrDefault();
                    });
                }
            }
            #endregion

            #region FIND CHILD COMPANY
            var companyId = entity.Select(x => (short?)x.companyId).Distinct();
            var childCompany = await dbContext.Company
                                              .AsNoTracking()
                                              .Where(x => companyId.Contains(x.parentCompanyId))
                                              .ToListAsync(cancellationToken: cancellationToken);

            if (!childCompany.IsEmpty())
            {
                #region RECURSIVE
                CompanyFunction funcCompany = new(dbContext);

                var childId = childCompany.Select(x => (short?)x.companyId).Distinct();
                var ggcCompany = await funcCompany.GenerateChildCompany(childId, cancellationToken);
                #endregion

                entity.ForEach(x =>
                {
                    var child = childCompany.Where(y => y.parentCompanyId.HasValue &&
                                                        y.parentCompanyId.Value == x.companyId)
                                            .ToList();

                    if (!child.IsEmpty() &&
                        !ggcCompany.IsEmpty())
                    {
                        child.ForEach(x =>
                        {
                            x.childCompany = ggcCompany.Where(y => y.parentCompanyId.HasValue &&
                                                                   y.parentCompanyId.Value == x.companyId)
                                                       .ToList();
                        });
                    }

                    x.childCompany = child;
                });
            }
            #endregion

            //DEFAULT ORDER AND SORT (ASCENDING BY COMPANY NAME)
            entity = entity.OrderBy(x => x.companyName).ToList();

            if (request.orderBy == Order.DESC &&
                request.sortBy == SortCompany.companyName)
            {
                entity = entity.OrderByDescending(x => x.companyName).ToList();
            }

            if (request.orderBy == Order.ASC &&
                request.sortBy == SortCompany.companyCode)
            {
                entity = entity.OrderBy(x => x.companyCode).ToList();
            }

            if (request.orderBy == Order.DESC &&
                request.sortBy == SortCompany.companyCode)
            {
                entity = entity.OrderByDescending(x => x.companyCode).ToList();
            }

            var total = entity.Count;

            request.row = request.row > 0 ? request.row : 10;
            request.page = request.page > 0 ? request.page : 1;

            entity = entity.Skip((request.page - 1) * request.row)
                           .Take(request.row)
                           .ToList();

            var data = entity.Adapt<IEnumerable<FindCompanyResponse>>();
            return response.Success(TransactionId, Message.Found("Company"),
                                    request.page, request.row, total, data);
        }
    }
}
