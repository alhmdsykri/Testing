namespace Sera.Application.Usecase
{
    public class GetCustomerContactListHandler : BaseHandler,
                 IRequestHandler<GetCustomerContactListRequest, Response<IEnumerable<GetCustomerContactListResponse>>>
    {
        public GetCustomerContactListHandler(IHttpContextAccessor httpContext, IDbContext dbContext)
        : base(httpContext, dbContext)
        { }

        public async Task<Response<IEnumerable<GetCustomerContactListResponse>>> Handle(
            GetCustomerContactListRequest request, CancellationToken cancellationToken)
        {
            var response = new Response<IEnumerable<GetCustomerContactListResponse>>();

            string functionName = string.Empty;

            IQueryable<SQL.CustomerContact>? query;

            query = dbContext.CustomerContact
                             .AsNoTracking()
                             .Where(x => x.customerId == request.customerId)
                             .OrderBy(x => x.contactName);

            var entity = await query.Select(s => new GetCustomerContactListResponse()
            {
                customerContactId = s.customerContactId,
                contactName = s.contactName,
                email = s.email,
                phoneNumber = s.phoneNumber,
                isPIC = s.isPIC
            }).ToListAsync(cancellationToken: cancellationToken);

            if (entity == null)
            {
                return response.Fail(TransactionId, Message.NotFound("Customer Contact"),
                                     new List<GetCustomerContactListResponse>());
            }

            var customerFunction = await dbContext.CustomerFunction
                                                  .AsNoTracking()
                                                  .ToListAsync(cancellationToken: cancellationToken);

            entity.ForEach(x =>
            {
                var contactId = entity.Select(x => x.customerContactId).Distinct().ToList();
                {
                    var ContactcustomerFunction = customerFunction.Where(y => y.customerContactId == x.customerContactId).ToList();

                    if (!ContactcustomerFunction.IsEmpty())
                    {
                        functionName = string.Empty;

                        foreach (var fd in ContactcustomerFunction)
                        {
                            functionName += fd.functionName;
                        }
                    }

                    string functionnamedata = functionName.AddSemicolonToSentence();
                    x.functionName = functionnamedata;
                }
            });

            return response.Success(TransactionId, Message.Found("Customer Contact"), entity);
        }
    }
}
