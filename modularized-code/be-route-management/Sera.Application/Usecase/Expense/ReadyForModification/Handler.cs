namespace Sera.Application.Usecase
{
    public class GetReadyForModificationHandler : BaseHandler, IRequestHandler<TripExpenseReadyForModificationRequest, Response<TripExpenseReadyForModificationResponse>>
    {
        public GetReadyForModificationHandler(IHttpContextAccessor httpContext, IDbContext dbContext, ICosmosContext eventContext, IMessage message)
            : base(httpContext, dbContext, eventContext, message)
        { }

        public async Task<Response<TripExpenseReadyForModificationResponse>> Handle(TripExpenseReadyForModificationRequest request, CancellationToken cancellationToken)
        {
            Response<TripExpenseReadyForModificationResponse> response = new();
            TripExpenseReadyForModificationResponse data = new();

            if (request.tripExpenseId > 0)
            {
                var tripExpense = dbContext.TripExpense
                                      .AsNoTracking()
                                      .Where(x => x.tripExpenseId == request.tripExpenseId)
                                                 .Select(x => new { x.transactionId }).FirstOrDefault();

                if (tripExpense.transactionId == null)
                {
                    data.isReady = false;
                }

                var cosmosDbRoute = await eventContext.GetAsync(tripExpense.transactionId, AppConst.TRIP_EXPENSE);

                if (cosmosDbRoute.status == null)
                {
                    data.isReady = false;
                }

                if (cosmosDbRoute.status == 2)
                {
                    data.isReady = true;
                }
                else
                {
                    data.isReady = false;
                }
            }
            return response.Success(TransactionId, Message.Found("Trip Expense"), data);
        }
    }
}
