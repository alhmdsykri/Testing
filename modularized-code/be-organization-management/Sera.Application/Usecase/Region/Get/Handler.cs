namespace Sera.Application.Usecase
{
    public class GetRegionHandler : BaseHandler,
        IRequestHandler<GetRegionRequest, Response<GetRegionResponse>>
    {
        public GetRegionHandler(IHttpContextAccessor httpContext, IDbContext dbContext)
            : base(httpContext, dbContext)
        { }

        public async Task<Response<GetRegionResponse>> Handle(
            GetRegionRequest request, CancellationToken cancellationToken)
        {
            Response<GetRegionResponse> response = new();
            var entity = await dbContext.Region
                                         .AsNoTracking()
                                         .Where(x => x.regionId == request.regionId)
                                         .FirstOrDefaultAsync();

            if (entity == null)
            {
                return response.Fail(TransactionId, Message.NotFound("Region"), null);
            }

            var data = entity.Adapt<GetRegionResponse>();
            return response.Success(TransactionId, Message.Found("Region"), data);
        }
    }
}
