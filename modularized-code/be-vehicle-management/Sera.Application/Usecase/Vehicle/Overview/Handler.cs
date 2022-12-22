namespace Sera.Application.Usecase
{
    public class GetOverviewVehicleHandler : BaseHandler,
        IRequestHandler<GetOverviewVehicleRequest, Response<GetOverviewVehicleResponse>>
    {
        public GetOverviewVehicleHandler(IHttpContextAccessor httpContext, IDbContext dbContext)
            : base(httpContext, dbContext)
        { }

        public async Task<Response<GetOverviewVehicleResponse>> Handle(
            GetOverviewVehicleRequest request, CancellationToken cancellationToken)
        {
            Response<GetOverviewVehicleResponse> response = new();

            //Validasi Vehicle Type Id Existing
            var vehicleTypeId = await dbContext.VehicleType
                                               .AsNoTracking()
                                               .Where(x => x.vehicleTypeId == request.vehicleTypeId &&
                                                           x.status == (int)EventStatus.COMPLETED)
                                               .FirstOrDefaultAsync(cancellationToken: cancellationToken);

            if (vehicleTypeId == null)
            {
                return response.Fail(TransactionId, Message.NotExist("Vehicle Type Id"), null);
            }

            var data = await dbContext.Vehicle.AsNoTracking()
                                              .Where(x => DRBAC.locations.Contains(x.locationId) &&
                                                          x.vehicleTypeId == request.vehicleTypeId &&
                                                          x.status == (int)EventStatus.COMPLETED)
                                              .GroupBy(x => x.vehicleTypeId)
                                              .Select(x => new GetOverviewVehicleResponse()
                                              {
                                                  vehicleTypeId = x.First().vehicleTypeId,
                                                  totalUnit = x.Count(),
                                                  unitFree = x.Count(x => x.vehicleStatus == (int)VehicleStatus.FREE),
                                                  onContract = x.Count(x => x.vehicleStatus == (int)VehicleStatus.ONCONTRACT),
                                                  onDuty = x.Count(x => x.vehicleStatus == (int)VehicleStatus.ONDUTY),
                                                  breakdown = x.Count(x => x.vehicleStatus == (int)VehicleStatus.BREAKDOWN),
                                                  unavailable = x.Count(x => x.vehicleStatus == (int)VehicleStatus.UNAVAILABLE),
                                                  missing = x.Count(x => x.vehicleStatus == (int)VehicleStatus.MISSING)

                                              })
                                              .FirstOrDefaultAsync(cancellationToken: cancellationToken);

            if (data == null)
            {
                return response.Fail(TransactionId, Message.NotFound("Vehicle"), null);
            }

            return response.Success(TransactionId, Message.Found("Vehicle"), data);
        }
    }
}
