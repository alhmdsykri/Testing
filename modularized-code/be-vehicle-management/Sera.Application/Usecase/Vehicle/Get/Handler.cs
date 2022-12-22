namespace Sera.Application.Usecase
{
    public class GetVehicleHandler : BaseHandler,
        IRequestHandler<GetVehicleRequest, Response<GetVehicleResponse>>
    {
        public GetVehicleHandler(IHttpContextAccessor httpContext, IDbContext dbContext)
            : base(httpContext, dbContext)
        { }

        public async Task<Response<GetVehicleResponse>> Handle(
            GetVehicleRequest request, CancellationToken cancellationToken)
        {
            Response<GetVehicleResponse> response = new();

            var vehicle = await dbContext.Vehicle
                                         .AsNoTracking()
                                         .Where(x => x.vehicleId == request.vehicleId &&
                                                     x.status == (int)EventStatus.COMPLETED)
                                         .Select(x => new GetVehicleResponse()
                                         {
                                             vehicleTypeCode = x.Vehicletype.vehicleTypeCode,
                                             vehicleTypeName = x.Vehicletype.vehicleTypeName,
                                             licensePlate = x.licensePlate,
                                             vin = x.vin,
                                             vehicleCategoryCode = x.VehicleCategory.vehicleCategoryCode,
                                             vehicleCategoryName = x.VehicleCategory.vehicleCategoryName,
                                             vehicleBrandCode = x.VehicleBrand.vehicleBrandCode,
                                             vehicleBrandName = x.VehicleBrand.vehicleBrandName,
                                             vehicleModelCode = x.VehicleModel.vehicleModelCode,
                                             vehicleModelName = x.VehicleModel.vehicleModelName,
                                             vehicleColorCode = x.VehicleColor.vehicleColorCode,
                                             vehicleColorName = x.VehicleColor.vehicleColorName,
                                             vehicleYear = x.vehicleYear,
                                             validFrom = x.validFrom,
                                             validTo = x.validTo,
                                             ownership = x.ownership,
                                             fuelTypeName = x.Fueltype.fuelTypeName,
                                             transmission = x.transmission == 1 ? "Automatic" : "Manual",
                                             hasOBD = x.hasOBD,
                                             branchCode = x.branchCode,
                                             branchName = x.branchName,
                                             businessUnitCode = x.businessUnitCode,
                                             businessUnitName = x.businessUnitName,
                                             locationCode = x.locationCode,
                                             locationName = x.locationName,
                                             currentLocationCode = x.currentLocationCode,
                                             currentLocationName = x.currentLocationName,
                                             customerContractNumber = x.customerContractNumber,
                                             customerName = x.customerName,
                                             vehicleStatus = x.vehicleStatus == 1 ? "Free" :
                                                             x.vehicleStatus == 2 ? "On Contract" :
                                                             x.vehicleStatus == 3 ? "On Duty" :
                                                             x.vehicleStatus == 4 ? "Breakdown" :
                                                             x.vehicleStatus == 5 ? "Unavailable" : "Missing",
                                             referenceNumber = x.referenceNumber,
                                             source = x.source
                                         }).FirstOrDefaultAsync(cancellationToken: cancellationToken);

            if (vehicle == null)
            {
                return response.Fail(TransactionId, Message.NotFound("Vehicle"), null);
            }

            return response.Success(TransactionId, Message.Found("Vehicle"), vehicle);
        }
    }
}
