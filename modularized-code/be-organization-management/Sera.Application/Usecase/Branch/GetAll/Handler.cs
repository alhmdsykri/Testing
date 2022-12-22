namespace Sera.Application.Usecase
{
    public class GetAllBranchHandler : BaseHandler,
        IRequestHandler<GetAllBranchRequest, Response<IEnumerable<GetAllBranchResponse>>>
    {
        public GetAllBranchHandler(IHttpContextAccessor httpContext, IDbContext dbContext)
            : base(httpContext, dbContext)
        { }

        public async Task<Response<IEnumerable<GetAllBranchResponse>>> Handle(
            GetAllBranchRequest request, CancellationToken cancellationToken)
        {
            var response = new Response<IEnumerable<GetAllBranchResponse>>();

            IQueryable<SQL.Branch> query = null;

            query = dbContext.Branch
                             .AsNoTracking()
                             .Include(x => x.BusinessUnit)
                             .Include(x => x.Region)
                             .Include(x => x.BusinessUnit.Company)
                             .Where(x => x.status == (int)EventStatus.COMPLETED);

            var domain = await query.Select(x => new GetAllBranchResponse()
            {
                BranchCode = x.branchCode,
                BranchName = x.branchName,
                BranchId = x.branchId,
                CompanyId = x.BusinessUnit.companyId,
                CompanyCode = x.BusinessUnit.Company.companyCode,
                CompanyName = x.BusinessUnit.Company.companyName,
                BusinessUnitCode = x.BusinessUnit.businessUnitCode,
                BusinessUnitId = x.businessUnitId,
                BusinessUnitName = x.BusinessUnit.businessUnitName,
                RegionId = x.regionId,
                RegionName = x.Region.regionName,
                SAPIntegrated = x.sapIntegrated,
            }).ToListAsync(cancellationToken: cancellationToken);

            if (domain.IsEmpty())
            {
                return response.Fail(TransactionId, Message.NotFound(AppConst.BRANCH),
                                     request.page, request.row, 0, new List<GetAllBranchResponse>());
            }

            //DEFAULT ORDER AND SORT (ASCENDING BY BRANCH NAME)
            domain = domain.OrderBy(x => x.BranchName).ToList();

            if (request.orderBy == Order.DESC &&
                request.sortBy == SortBranch.branchName)
            {
                domain = domain.OrderByDescending(x => x.BranchName).ToList();
            }

            if (request.orderBy == Order.ASC &&
                request.sortBy == SortBranch.branchCode)
            {
                domain = domain.OrderBy(x => x.BranchCode).ToList();
            }

            if (request.orderBy == Order.DESC &&
                request.sortBy == SortBranch.branchCode)
            {
                domain = domain.OrderByDescending(x => x.BranchCode).ToList();
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

            var data = domain.Adapt<IEnumerable<GetAllBranchResponse>>();
            return response.Success(TransactionId, Message.Found(AppConst.BRANCH),
                                    request.page, nextPage, request.row, total, data);

        }
    }
}