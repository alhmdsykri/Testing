namespace Sera.Application.Usecase
{
    public class GetBranchHandler : BaseHandler,
        IRequestHandler<GetBranchRequest, Response<GetBranchResponse>>
    {
        public GetBranchHandler(IHttpContextAccessor httpContext, IDbContext dbContext)
            : base(httpContext, dbContext)
        { }

        public async Task<Response<GetBranchResponse>> Handle(
            GetBranchRequest request, CancellationToken cancellationToken)
        {
            Response<GetBranchResponse> response = new();

            var domain = await dbContext.Branch
                                        .AsNoTracking()
                                        .Include(x => x.BusinessUnit)
                                        .Include(x => x.Region)
                                        .Where(x => x.branchId == request.branchId)
                                        .Select(x => new GetBranchResponse()
                                        {
                                            BranchId = x.branchId,
                                            BranchCode = x.branchCode,
                                            BranchName = x.branchName,
                                            BusinessUnitId = x.businessUnitId,
                                            BusinessUnitCode = x.BusinessUnit.businessUnitCode,
                                            BusinessUnitName = x.BusinessUnit.businessUnitName,
                                            RegionId = x.regionId,
                                            RegionName = x.Region.regionName,
                                            SAPIntegrated = x.sapIntegrated
                                        })
                                        .FirstOrDefaultAsync(cancellationToken: cancellationToken);

            if (domain == null)
            {
                return response.Fail(TransactionId, Message.NotFound("Branch"), null);
            }

            return response.Success(TransactionId, Message.Found("Branch"), domain);
        }
    }
}
