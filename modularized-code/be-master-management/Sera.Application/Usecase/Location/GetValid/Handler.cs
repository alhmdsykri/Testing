namespace Sera.Application.Usecase
{
    public class GetValidLocationHandler : BaseHandler,
        IRequestHandler<GetValidLocationRequest, Response<GetValidLocationResponse>>
    {

        public GetValidLocationHandler(IHttpContextAccessor httpContext, IDbContext dbContext, IRESTRouteClient routeClient,
                                       IRESTVehicleClient vehicleClient, IRESTDriverClient driverClient, IMessage message)
               : base(httpContext, dbContext, routeClient, vehicleClient, driverClient, message)
        { }

        public async Task<Response<GetValidLocationResponse>> Handle(GetValidLocationRequest request,
                                                                     CancellationToken cancellationToken)
        {
            Response<GetValidLocationResponse> response = new();
            GetValidLocationResponse data = new();

            var routeResponse = await routeClient.GetRouteAsync(TransactionId, UserId, request.locationId);

            if (routeResponse.Data.Count() > 0)
            {
                data.isValid = true;
                return response.Success(TransactionId, Message.Found("Location"), data);
            }

            var routeArrivalPoolIdResponse = await routeClient.GetRouteArrivalAsync(TransactionId, UserId, request.locationId);

            if (routeArrivalPoolIdResponse.Data.Count() > 0)
            {
                data.isValid = true;
                return response.Success(TransactionId, Message.Found("Location"), data);
            }

            var routeLocationResponse = await routeClient.GetRoutelocationAsync(TransactionId, UserId, request.locationId);

            if (routeLocationResponse.Data != null) // response from API if data not found is null
            {
                if (routeLocationResponse.Data.Count() > 0)
                {
                    data.isValid = true;
                    return response.Success(TransactionId, Message.Found("Location"), data);
                }
            }

            var vehicleResponse = await vehicleClient.GetVehicleAsync(TransactionId, UserId, request.locationId);

            if (vehicleResponse.Data.Count() > 0)
            {
                data.isValid = true;
                return response.Success(TransactionId, Message.Found("Location"), data);
            }

            var driverResponse = await driverClient.GetDriverlocationAsync(TransactionId, UserId, request.locationId);

            if (driverResponse.Data.isValid == true)
            {
                data.isValid = true;
                return response.Success(TransactionId, Message.Found("Location"), data);
            }

            return response.Success(TransactionId, Message.Found("Location"), data);

        }
    }
}