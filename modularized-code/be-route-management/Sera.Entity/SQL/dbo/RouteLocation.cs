namespace Sera.Entity.SQL
{
    [ExcludeFromCodeCoverage]
    [Table("RouteLocation", Schema = "dbo")]
    public partial class RouteLocation
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int routeLocationId { get; set; }
        public int? sequenceNumber { get; set; }
        public int routeId { get; set; }
        public int? routeActionId { get; set; }
        public int? locationTypeId { get; set; }
        public int locationId { get; set; }
        public string locationCode { get; set; }
        public string locationName { get; set; }
        public int? branchId { get; set; }
        public string? branchCode { get; set; }
        public string? branchName { get; set; }
        public int? timezone { get; set; }
        public decimal latitude { get; set; }
        public decimal longitude { get; set; }
        public decimal? distanceToNextLocation { get; set; }
        public int status { get; set; }
        public DateTime createdAt { get; set; }
        public int createdBy { get; set; }
        public DateTime? modifiedAt { get; set; }
        public int? modifiedBy { get; set; }
        public int version { get; set; }
        public string? transactionId { get; set; }

        [ForeignKey("routeId")]
        public Route route { get; set; }

        [ForeignKey("routeActionId")]
        public RouteAction? routeAction { get; set; }
    }
}