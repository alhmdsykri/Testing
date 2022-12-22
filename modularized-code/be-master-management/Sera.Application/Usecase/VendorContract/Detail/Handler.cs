namespace Sera.Application.Usecase
{
    public class GetVendorContractDetailHandler :
        BaseHandler, IRequestHandler<GetVendorContractDetailRequest, Response<GetVendorContractDetailResponse>>
    {
        public GetVendorContractDetailHandler(IHttpContextAccessor httpContext, IDbContext dbContext) :
            base(httpContext, dbContext)
        { }

        public async Task<Response<GetVendorContractDetailResponse>> Handle(
            GetVendorContractDetailRequest request, CancellationToken cancellationToken)
        {
            var response = new Response<GetVendorContractDetailResponse>();

            var data = await dbContext.VendorContract
                                      .Include(x => x.vendor)
                                      .AsNoTracking()
                                      .Select(x => new GetVendorContractDetailResponse()
                                      {
                                          vendorContractId = x.vendorContractId,
                                          vendorName = x.vendor.vendorName,
                                          vendorContractNumber = x.vendorContractNumber,
                                          vendorContractType = x.vendorContractType,
                                          vendorContractStatus = x.vendorContractStatus,
                                          vendorContractPeriod = $"{x.startDate:dd MMM yyyy} - {x.endDate:dd MMM yyyy}",
                                          companyName = x.companyName,
                                          businessUnitName = x.businessUnitName,
                                          startDate = x.startDate,
                                          endDate = x.endDate,
                                      }).FirstOrDefaultAsync(y => y.vendorContractId == request.vendorContractId);

            if (data == null || data.vendorContractId <= 0)
            {
                return response.Fail(TransactionId, Message.NotFound("Vendor contract"), null);
            }

            return response.Success(TransactionId, Message.Found("Vendor Contract"), data);
        }
    }
}
