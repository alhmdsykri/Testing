namespace Sera.Application.Usecase
{
    public class GetUOMHandler : BaseHandler,
         IRequestHandler<GetUOMRequest, Response<IEnumerable<GetUOMResponse>>>
    {
        public GetUOMHandler(IHttpContextAccessor httpContext, IDbContext dbContext)
            : base(httpContext, dbContext)
        { }

        public async Task<Response<IEnumerable<GetUOMResponse>>> Handle(
            GetUOMRequest request, CancellationToken cancellationToken)
        {
            var response = new Response<IEnumerable<GetUOMResponse>>();

            List<GetUOMResponse> data = new();
            IQueryable<SQL.UOM> query = null;

            query = dbContext.UOM.AsNoTracking()
                                 .Where(x => x.status == (int)EventStatus.COMPLETED);

            data.AddRange(await query.Select(x => new GetUOMResponse()
            {
                uomCode = x.uomCode,
                uomName = x.uomName
            }).ToListAsync(cancellationToken));

            if (data == null)
            {
                return response.Fail(TransactionId, Message.NotFound("UOM"), null);
            }

            return response.Success(TransactionId, Message.Found("UOM"), data);
        }
    }
}
