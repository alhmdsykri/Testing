namespace Sera.Application.Usecase
{
    public class GetBUHandler : BaseHandler,
        IRequestHandler<GetBURequest, Response<GetBUResponse>>
    {
        public GetBUHandler(IHttpContextAccessor httpContext, IDbContext dbContext)
            : base(httpContext, dbContext)
        { }

        public async Task<Response<GetBUResponse>> Handle(
            GetBURequest request, CancellationToken cancellationToken)
        {
            Response<GetBUResponse> response = new();

            var data = await dbContext.BusinessUnit
                                      .AsNoTracking()
                                      .Include(x => x.Company)
                                      .Select(x => new GetBUResponse()
                                      {
                                          businessUnitCode = x.businessUnitCode,
                                          businessUnitId = x.businessUnitId,
                                          businessUnitName = x.businessUnitName,
                                          companyCode = x.Company.companyCode,
                                          companyId = x.companyId,
                                          companyName = x.Company.companyName,
                                          sapIntegrated = x.sapIntegrated
                                      })
                                      .Where(x => x.businessUnitId == request.businessUnitId)
                                      .FirstOrDefaultAsync(cancellationToken);

            if (data == null)
            {
                return response.Fail(TransactionId, Message.NotFound("Business Unit"), null);
            }

            return response.Success(TransactionId, Message.Found("Business Unit"), data);
        }
    }
}
