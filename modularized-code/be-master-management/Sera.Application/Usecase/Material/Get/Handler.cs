namespace Sera.Application.Usecase.Material.Get
{
    public class GetMaterialHandler : BaseHandler,
                 IRequestHandler<GetMaterialRequest, Response<IEnumerable<GetMaterialResponse>>>
    {
        public GetMaterialHandler(IHttpContextAccessor httpContext, IDbContext dbContext)
            : base(httpContext, dbContext)
        { }

        public async Task<Response<IEnumerable<GetMaterialResponse>>> Handle(
            GetMaterialRequest request, CancellationToken cancellationToken)
        {
            var response = new Response<IEnumerable<GetMaterialResponse>>();

            var material = await dbContext.Material.AsNoTracking()
                                                   .Where(x => DRBAC.businessUnits.Contains(x.businessUnitId.Value) &&
                                                          x.status == (int)EventStatus.COMPLETED)
                                                   .Select(s => new GetMaterialResponse()
                                                   {
                                                       materialId = s.materialId,
                                                       materialCode = s.materialCode.ToString().Trim(),
                                                       materialName = s.materialName.ToString().Trim()
                                                   }).ToListAsync(cancellationToken: cancellationToken);
            if (material == null)
            {
                return response.Fail(TransactionId, Message.NotFound("Material"), null);
            }

            return response.Success(TransactionId, Message.Found("Material"), material);
        }
    }
}
