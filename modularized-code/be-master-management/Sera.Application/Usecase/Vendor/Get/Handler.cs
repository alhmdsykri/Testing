namespace Sera.Application.Usecase
{
    public class GetVendorHandler : BaseHandler, IRequestHandler<GetVendorRequest, Response<GetVendorResponse>>
    {
        public GetVendorHandler(IHttpContextAccessor httpContext, IDbContext dbContext)
            : base(httpContext, dbContext)
        { }

        public async Task<Response<GetVendorResponse>> Handle(GetVendorRequest request, CancellationToken cancellationToken)
        {
            Response<GetVendorResponse> response = new();

            var entity = await dbContext.Vendor
                                        .AsNoTracking()
                                        .Where(x => x.vendorId == request.vendorId)
                                        .Select(x => new GetVendorResponse()
                                        {
                                            vendorName = x.vendorName,
                                            vendorCode = x.vendorCode
                                        }).FirstOrDefaultAsync(cancellationToken: cancellationToken);

            if (entity == null)
            {
                return response.Fail(TransactionId, Message.NotFound("Vendor"), null);
            }

            var data = entity.Adapt<GetVendorResponse>();

            return response.Success(TransactionId, Message.Found("Vendor"), data);
        }
    }
}