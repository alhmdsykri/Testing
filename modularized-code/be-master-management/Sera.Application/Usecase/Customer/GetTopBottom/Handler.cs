namespace Sera.Application.Usecase
{
    public class GetTopBottomCustomerHandler : BaseHandler,
        IRequestHandler<GetTopBottomCustomerRequest, Response<GetTopBottomCustomerResponse>>
    {
        public GetTopBottomCustomerHandler(IHttpContextAccessor httpContext, IDbContext dbContext) :
            base(httpContext, dbContext)
        { }

        public async Task<Response<GetTopBottomCustomerResponse>> Handle(
            GetTopBottomCustomerRequest request, CancellationToken cancellationToken)
        {
            var response = new Response<GetTopBottomCustomerResponse>();
            var data = new GetTopBottomCustomerResponse();

            List<TopCustomer> topData = new();
            List<BottomCustomer> bottomData = new();

            int yearNow = DateTime.Now.Year;
            int monthNow = DateTime.Now.Month;

            if (request.period == (int)Period.YearToDate)
            {
                IQueryable<SQL.OrderCustomerYearlySummary> query = null;

                query = dbContext.OrderCustomerYearlySummary
                                 .AsNoTracking()
                                 .Include(i => i.customer)
                                 .Where(x => DRBAC.businessUnits.Contains(x.BusinessUnitId) &&
                                             x.Status == (int)EventStatus.COMPLETED &&
                                             x.YearReference == yearNow);

                if (!string.IsNullOrWhiteSpace(request.businessUnitCode))
                {
                    query = query.AsNoTracking()
                                 .Where(x => EF.Functions.Like(x.BusinessUnitCode,
                                             $"%{request.businessUnitCode}%"));
                }

                topData = await query.AsNoTracking()
                                     .Select(s => new TopCustomer()
                                     {
                                         CustomerId = s.CustomerId,
                                         CustomerName = s.customer.customerName,
                                         customerLogo = s.customer.customerLogo,
                                         value = s.Value,
                                         industry = string.Empty
                                     })
                                    .Distinct().Take(5)
                                    .OrderByDescending(o => o.value)
                                    .ToListAsync(cancellationToken);

                bottomData = await query.AsNoTracking()
                                        .Select(s => new BottomCustomer()
                                        {
                                            CustomerId = s.CustomerId,
                                            CustomerName = s.customer.customerName,
                                            customerLogo = s.customer.customerLogo,
                                            value = s.Value,
                                            industry = string.Empty
                                        })
                                        .Distinct().Take(5)
                                        .OrderBy(o => o.value)
                                        .ToListAsync(cancellationToken);

                data.topCustomer = topData;
                data.bottomCustomer = bottomData;
            }

            if (request.period == (int)Period.MonthToDate)
            {
                IQueryable<SQL.OrderCustomerMonthlySummary> query = null;

                query = dbContext.OrderCustomerMonthlySummary
                                 .AsNoTracking()
                                 .Include(i => i.customer)
                                 .Where(x => x.DateReference.Year == yearNow &&
                                             x.DateReference.Month == monthNow);

                if (!string.IsNullOrWhiteSpace(request.businessUnitCode))
                {
                    query = query.AsNoTracking()
                                 .Where(x => EF.Functions.Like(x.BusinessUnitCode,
                                             $"%{request.businessUnitCode}%"));
                }

                topData = await query.AsNoTracking()
                                     .Select(s => new TopCustomer()
                                     {
                                         CustomerId = s.CustomerId,
                                         CustomerName = s.customer.customerName,
                                         customerLogo = s.customer.customerLogo,
                                         value = s.Value,
                                         industry = string.Empty
                                     })
                                    .Distinct().Take(5)
                                    .OrderByDescending(o => o.value)
                                    .ToListAsync(cancellationToken);

                bottomData = await query.AsNoTracking()
                                        .Select(s => new BottomCustomer()
                                        {
                                            CustomerId = s.CustomerId,
                                            CustomerName = s.customer.customerName,
                                            customerLogo = s.customer.customerLogo,
                                            value = s.Value,
                                            industry = string.Empty
                                        })
                                        .Distinct().Take(5)
                                        .OrderBy(o => o.value)
                                        .ToListAsync(cancellationToken);

                data.topCustomer = topData;
                data.bottomCustomer = bottomData;
            }

            return response.Success(TransactionId, Message.Found("Customer Top Bottom"), data);
        }
    }
}
