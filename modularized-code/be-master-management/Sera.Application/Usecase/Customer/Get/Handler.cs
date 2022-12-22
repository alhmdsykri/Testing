namespace Sera.Application.Usecase
{
    public class GetCustomerHandler : BaseHandler,
        IRequestHandler<GetCustomerRequest, Response<GetCustomerResponse>>
    {
        public GetCustomerHandler(IHttpContextAccessor httpContext, IDbContext dbContext)
            : base(httpContext, dbContext)
        { }

        public async Task<Response<GetCustomerResponse>> Handle(GetCustomerRequest request,
                                                                CancellationToken cancellationToken)
        {
            Response<GetCustomerResponse> response = new();
            var customer = await dbContext.Customer
                                          .AsNoTracking()
                                          .Where(x => x.customerId == request.customerId)
                                          .Select(x => new GetCustomerResponse()
                                          {
                                              CustomerId = x.customerId,
                                              CustomerCode = x.customerCode,
                                              CustomerName = x.customerName,
                                              IndustryId = 1,
                                              IndustryName = string.Empty, //[REVISIT]
                                              CustomerAddress = x.customerAddress,
                                              Status = x.isBlocked == true ? "Blocked" : "Active"
                                          }).FirstOrDefaultAsync(cancellationToken: cancellationToken);

            if (customer == null)
            {
                return response.Fail(TransactionId, Message.NotFound("Customer"), null);
            }

            return response.Success(TransactionId, Message.Found("Customer"), customer);
        }
    }
}