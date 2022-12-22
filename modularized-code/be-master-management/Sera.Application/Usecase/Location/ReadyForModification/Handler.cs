namespace Sera.Application.Usecase
{
    public class GetReadyForModificationHandler : BaseHandler,
                 IRequestHandler<LocationReadyForModificationRequest, Response<LocationReadyForModificationResponse>>
    {
        public GetReadyForModificationHandler(IHttpContextAccessor httpContext, IDbContext dbContext,
                                              ICosmosContext eventContext, IMessage message)
               : base(httpContext, dbContext, eventContext, message)
        { }

        public async Task<Response<LocationReadyForModificationResponse>> Handle(LocationReadyForModificationRequest request,
                     CancellationToken cancellationToken)
        {
            Response<LocationReadyForModificationResponse> response = new();
            LocationReadyForModificationResponse data = new();

            if (request.locationId > 0)
            {
                var location = dbContext.Location
                                      .AsNoTracking()
                                      .Where(x => x.locationId == request.locationId &&
                                             x.status == (int)EventStatus.COMPLETED)
                                      .Select(x => new { x.transactionId }).FirstOrDefault();

                if (location != null || location.transactionId == null)
                {
                    data.isReady = false; ;
                }
                else
                {
                    var cosmosDbLocation = await eventContext.GetAsync(location.transactionId, AppConst.LOCATION);

                    if (cosmosDbLocation == null || cosmosDbLocation.status == null)
                    {
                        data.isReady = false;
                    }

                    if (cosmosDbLocation != null && cosmosDbLocation.status == 2)
                    {
                        data.isReady = true;
                    }
                    else
                    {
                        data.isReady = false;
                    }
                }
            }
            return response.Success(TransactionId, Message.Found("Location"), data);
        }
    }
}