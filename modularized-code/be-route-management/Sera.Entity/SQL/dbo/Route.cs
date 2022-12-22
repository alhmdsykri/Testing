namespace Sera.Entity.SQL
{
    [ExcludeFromCodeCoverage]
    [Table("Route", Schema = "dbo")]
    public partial class Route
    {
        public Route()
        {
            RouteLocation = new HashSet<RouteLocation>();
        }

        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int routeId { get; set; }
        public int routeCode { get; set; }
        public string routeName { get; set; }
        public int? contractId { get; set; }
        public int businessUnitId { get; set; }
        public int? departurePoolId { get; set; }
        public string? departurePoolCode { get; set; }
        public string? departurePoolName { get; set; }
        public int? arrivalPoolId { get; set; }
        public string? arrivalPoolCode { get; set; }
        public string? arrivalPoolName { get; set; }
        public int? returnRouteId { get; set; }
        public int? returnRouteCode { get; set; }
        public string? returnRouteName { get; set; }
        public DateTime lastUpdate { get; set; }
        public string routeJSON { get; set; }
        public string routeKML { get; set; }
        public int? customerId { get; set; }
        public string? customerCode { get; set; }
        public string? customerName { get; set; }
        public string? contractNumber { get; set; }
        public int status { get; set; }
        public int completionStatus { get; set; }
        public DateTime createdAt { get; set; }
        public int createdBy { get; set; }
        public DateTime? modifiedAt { get; set; }
        public int? modifiedBy { get; set; }
        public int version { get; set; }
        public string? transactionId { get; set; }
        public ICollection<RouteLocation> RouteLocation { get; set; }
    }
}