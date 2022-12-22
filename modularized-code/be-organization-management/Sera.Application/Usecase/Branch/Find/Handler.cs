namespace Sera.Application.Usecase
{
    public class FindBranchHandler : BaseHandler,
        IRequestHandler<FindBranchRequest, Response<IEnumerable<FindBranchResponse>>>
    {
        public FindBranchHandler(IHttpContextAccessor httpContext, IDbContext dbContext)
            : base(httpContext, dbContext)
        { }

        public async Task<Response<IEnumerable<FindBranchResponse>>> Handle(
            FindBranchRequest request, CancellationToken cancellationToken)
        {
            var response = new Response<IEnumerable<FindBranchResponse>>();

            IQueryable<SQL.Branch> query = null;

            //DEFAULT QUERY BY DRBAC
            query = dbContext.Branch
                             .AsNoTracking()
                             .Include(x => x.BusinessUnit)
                             .Include(x => x.Region)
                             .Where(x => DRBAC.branches.Contains(x.branchId) &&
                                         x.status == (int)EventStatus.COMPLETED);

            if (!string.IsNullOrWhiteSpace(request.branchCode))
            {
                query = query.AsNoTracking()
                             .Where(x => EF.Functions.Like(x.branchCode,
                                                           $"%{request.branchCode}%"));
            }

            if (!string.IsNullOrWhiteSpace(request.branchName))
            {
                query = query.AsNoTracking()
                             .Where(x => EF.Functions.Like(x.branchName,
                                                           $"%{request.branchName}%"));
            }

            if (!string.IsNullOrWhiteSpace(request.businessUnitName))
            {
                query = query.AsNoTracking()
                             .Where(x => EF.Functions.Like(x.BusinessUnit.businessUnitName,
                                                           $"%{request.businessUnitName}%"));
            }

            if (!string.IsNullOrWhiteSpace(request.businessUnitCode))
            {
                query = query.AsNoTracking()
                             .Where(x => EF.Functions.Like(x.BusinessUnit.businessUnitCode,
                                                           $"%{request.businessUnitCode}%"));
            }

            if (!string.IsNullOrWhiteSpace(request.regionName))
            {
                query = query.AsNoTracking()
                             .Where(x => EF.Functions.Like(x.Region.regionName,
                                                           $"%{request.regionName}%"));
            }

            var domain = await query.Select(x => new FindBranchResponse()
            {
                BranchCode = x.branchCode,
                BranchName = x.branchName,
                BranchId = x.branchId,
                BusinessUnitCode = x.BusinessUnit.businessUnitCode,
                BusinessUnitId = x.businessUnitId,
                BusinessUnitName = x.BusinessUnit.businessUnitName,
                RegionId = x.regionId,
            }).ToListAsync(cancellationToken: cancellationToken);

            if (domain.IsEmpty())
            {
                return response.Fail(TransactionId, Message.NotFound("Branch"),
                                     request.page, request.row, 0, new List<FindBranchResponse>());
            }

            //DEFAULT ORDER AND SORT (ASCENDING BY BRANCH NAME)
            domain = domain.OrderBy(x => x.BranchName).ToList();

            #region BRANCH NAME
            if (request.orderBy == Order.DESC &&
                request.sortBy == SortBranch.branchName)
            {
                domain = domain.OrderByDescending(x => x.BranchName).ToList();
            }
            #endregion

            #region BRANCH CODE
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
            #endregion

            #region BU CODE
            if (request.orderBy == Order.ASC &&
                request.sortBy == SortBranch.businessUnitCode)
            {
                domain = domain.OrderBy(x => x.BusinessUnitCode).ToList();
            }

            if (request.orderBy == Order.DESC &&
                request.sortBy == SortBranch.businessUnitCode)
            {
                domain = domain.OrderByDescending(x => x.BusinessUnitCode).ToList();
            }
            #endregion

            #region BU NAME
            if (request.orderBy == Order.ASC &&
                request.sortBy == SortBranch.businessUnitName)
            {
                domain = domain.OrderBy(x => x.BusinessUnitName).ToList();
            }

            if (request.orderBy == Order.DESC &&
                request.sortBy == SortBranch.businessUnitName)
            {
                domain = domain.OrderByDescending(x => x.BusinessUnitName).ToList();
            }
            #endregion

            #region REGION
            if (request.orderBy == Order.ASC &&
                request.sortBy == SortBranch.regionName)
            {
                domain = domain.OrderBy(x => x.RegionName).ToList();
            }

            if (request.orderBy == Order.DESC &&
                request.sortBy == SortBranch.regionName)
            {
                domain = domain.OrderByDescending(x => x.RegionName).ToList();
            }
            #endregion

            var total = domain.Count;

            request.row = request.row > 0 ? request.row : 10;
            request.page = request.page > 0 ? request.page : 1;

            domain = domain.Skip((request.page - 1) * request.row)
                           .Take(request.row)
                           .ToList();

            return response.Success(TransactionId, Message.Found("Branch"),
                                    request.page, request.row, total, domain);
        }
    }
}
