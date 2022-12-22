namespace Sera.Application.Usecase
{
    public class GetAllCompanyHandler : BaseHandler,
        IRequestHandler<GetAllCompanyRequest, Response<IEnumerable<GetAllCompanyResponse>>>
    {
        public GetAllCompanyHandler(IHttpContextAccessor httpContext, IDbContext dbContext) :
            base(httpContext, dbContext)
        { }

        public async Task<Response<IEnumerable<GetAllCompanyResponse>>> Handle(
            GetAllCompanyRequest request, CancellationToken cancellationToken)
        {
            var response = new Response<IEnumerable<GetAllCompanyResponse>>();

            IQueryable<SQL.Company> query = null;

            query = dbContext.Company
                             .AsNoTracking()
                             .Where(x => x.status == (int)EventStatus.COMPLETED);

            var entity = await query.ToListAsync(cancellationToken);

            if (entity.IsEmpty())
            {
                return response.Fail(TransactionId, Message.NotFound(AppConst.COMPANY),
                                     request.page, request.row, 0, 0, new List<GetAllCompanyResponse>());
            }

            #region FIND PARENT COMPANY
            var parentId = entity.Select(x => x.parentCompanyId).Distinct();
            if (!parentId.IsEmpty())
            {
                var parentCompany = await dbContext.Company
                                                   .AsNoTracking()
                                                   .Where(x => parentId.Contains(x.companyId) &&
                                                          x.status == (int)EventStatus.COMPLETED)
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
                                              .Where(x => companyId.Contains(x.parentCompanyId) &&
                                                     x.status == (int)EventStatus.COMPLETED)
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

            entity = entity.Skip((request.page - 1) * request.row)
                           .Take(request.row)
                           .ToList();

            var data = entity.Adapt<IEnumerable<GetAllCompanyResponse>>();
            return response.Success(TransactionId, Message.Found(AppConst.COMPANY),
                                    request.page, nextPage, request.row, total, data);
        }
    }
}