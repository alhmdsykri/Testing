namespace Sera.Application.Usecase
{
    public class GetCustomerContactDetailsHandler : BaseHandler,
        IRequestHandler<GetCustomerContactDetailsRequest, Response<GetCustomerContactDetailsResponse>>
    {
        public GetCustomerContactDetailsHandler(IHttpContextAccessor httpContext, IDbContext dbContext)
            : base(httpContext, dbContext)
        { }

        public async Task<Response<GetCustomerContactDetailsResponse>> Handle(
            GetCustomerContactDetailsRequest request, CancellationToken cancellationToken)
        {
            string functionname = string.Empty;
            Response<GetCustomerContactDetailsResponse> response = new();

            var customerContact = await dbContext.CustomerContact
                                                 .AsNoTracking()
                                                 .Where(x => x.customerContactId == request.customerContactId)
                                                 .Select(x => new GetCustomerContactDetailsResponse()
                                                 {
                                                     customerContactId = x.customerContactId,                                          
                                                     contactName = x.contactName,
                                                     phoneNumber = x.phoneNumber,
                                                     email = x.email,
                                                     position = x.position,                                                     
                                                     department = x.department,
                                                     remarks = x.remarks,
                                                     isPIC = x.isPIC
                                                 }).FirstOrDefaultAsync(cancellationToken: cancellationToken);

            if (customerContact == null)
            {
                return response.Fail(TransactionId, Message.NotFound("Customer Contact"), null);
            }

            var customerFunction = await dbContext.CustomerFunction
                                                  .AsNoTracking()
                                                  .Where(x => x.customerContactId == customerContact.customerContactId)
                                                  .ToListAsync(cancellationToken: cancellationToken);
            
            if (!customerFunction.IsEmpty())
            {
                foreach (var fd in customerFunction)
                {
                    functionname += fd.functionName;
                }
            }

            string functionnamedata = functionname.AddSemicolonToSentence();

            var data = customerContact.Adapt<GetCustomerContactDetailsResponse>();
            data.functionName = functionnamedata;

            return response.Success(TransactionId, Message.Found("Customer Contact"), data);
        }
    }
}