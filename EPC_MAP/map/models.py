from django.db import models

RATING_CHOICES = (
    ('very_good','very good'),
    ('good','good'),
    ('average','average'),
    ('poor','poor'),
    ('very_poor','very poor'),
)

class Certificate(models.Model):
    """
    Model representing an Energy Performance Certificate for a property.
    Contains all information related to the property, its energy ratings,
    and various physical characteristics.
    """
    # Core Identifiers
    lmk_key = models.CharField(max_length=100, primary_key=True, help_text="Individual lodgement identifier")
    building_reference_number = models.CharField(max_length=100, blank=True, null=True,
                                                 help_text="Unique identifier for the property")
    uprn = models.BigIntegerField(blank=True, null=True, help_text="Unique Property Reference Number")
    uprn_source = models.CharField(max_length=20, blank=True, null=True,
                                   help_text="Source of UPRN ('Energy Assessor' or 'Address Matched')")

    # Address Fields
    address1 = models.CharField(max_length=255, blank=True, null=True)
    address2 = models.CharField(max_length=255, blank=True, null=True)
    address3 = models.CharField(max_length=255, blank=True, null=True)
    address = models.CharField(max_length=765, blank=True, null=True,
                               help_text="Concatenation of address1, address2, address3")
    postcode = models.CharField(max_length=10, blank=True, null=True)
    posttown = models.CharField(max_length=100, blank=True, null=True)

    latitude = models.DecimalField(max_digits=10, decimal_places=6, verbose_name='Latitude', null=True, blank=True,
                                   editable=False)
    longitude = models.DecimalField(max_digits=10, decimal_places=6, verbose_name='Longitude', null=True, blank=True,
                                    editable=False)

    # Administrative Areas
    local_authority = models.CharField(max_length=50, blank=True, null=True, help_text="ONS code for local authority")
    local_authority_label = models.CharField(max_length=100, blank=True, null=True, help_text="Name of local authority")
    constituency = models.CharField(max_length=50, blank=True, null=True,
                                    help_text="ONS code for parliamentary constituency")
    constituency_label = models.CharField(max_length=100, blank=True, null=True,
                                          help_text="Name of parliamentary constituency")
    county = models.CharField(max_length=100, blank=True, null=True)

    # Dates and Transaction Info
    inspection_date = models.DateField(blank=True, null=True)
    lodgement_date = models.DateField(blank=True, null=True)
    lodgement_datetime = models.DateTimeField(blank=True, null=True)
    transaction_type = models.CharField(max_length=100, blank=True, null=True,
                                        help_text="Type of transaction that triggered EPC")
    tenure = models.CharField(max_length=150, blank=True, null=True, help_text="Tenure type of the property")

    # Property Characteristics
    property_type = models.CharField(max_length=50, blank=True, null=True,
                                     help_text="Type of property (House, Flat, etc.)")
    built_form = models.CharField(max_length=50, blank=True, null=True,
                                  help_text="Building type (Detached, Semi-Detached, etc.)")
    total_floor_area = models.DecimalField(max_digits=10, decimal_places=3, blank=True, null=True,
                                           help_text="Total useful floor area in m²")
    floor_level = models.CharField(max_length=20, blank=True, null=True,
                                   help_text="Floor level for flats and maisonettes")
    flat_top_storey = models.CharField(max_length=5, blank=True, null=True, help_text="Whether flat is on top storey")
    flat_storey_count = models.DecimalField(max_digits=5, decimal_places=2, blank=True, null=True,
                                            help_text="Number of storeys in apartment block")

    CONSTRUCTION_AGE_CHOICES = (
        ('before-1900', 'before 1900'),
        ('1900-1929', '1900-1929'),
        ('1930-1949', '1930-1949'),
        ('1950-1966', '1950-1966'),
        ('1967-1975', '1967-1975'),
        ('1976-1982', '1976-1982'),
        ('1983-1990', '1983-1990'),
        ('1991-1995', '1991-1995'),
        ('1996-2002', '1996-2002'),
        ('2003-2006', '2003-2006'),
        ('2007-2011', '2007-2011'),
        ('2012-onwards', '2012 onwards'),
    )
    construction_age_band = models.CharField(max_length=40, choices=CONSTRUCTION_AGE_CHOICES, blank=True, null=True,
                                             help_text="Age band when building constructed")

    # Room Information
    number_habitable_rooms = models.FloatField(blank=True, null=True)
    number_heated_rooms = models.FloatField(blank=True, null=True)
    floor_height = models.DecimalField(max_digits=7, decimal_places=3, blank=True, null=True,
                                       help_text="Average height of storey in meters")
    heat_loss_corridor = models.CharField(max_length=20, blank=True, null=True)
    unheated_corridor_length = models.DecimalField(max_digits=7, decimal_places=3, blank=True, null=True)

    # Energy Ratings
    current_energy_rating = models.CharField(max_length=1, blank=True, null=True,
                                             help_text="Current energy rating (A to G)")
    potential_energy_rating = models.CharField(max_length=1, blank=True, null=True,
                                               help_text="Potential energy rating (A to G)")
    current_energy_efficiency = models.IntegerField(blank=True, null=True, help_text="Current energy efficiency value")
    potential_energy_efficiency = models.IntegerField(blank=True, null=True,
                                                      help_text="Potential energy efficiency value")

    # Environmental Impact
    environmental_impact_current = models.IntegerField(blank=True, null=True,
                                                       help_text="Current environmental impact rating")
    environmental_impact_potential = models.IntegerField(blank=True, null=True,
                                                         help_text="Potential environmental impact rating")

    # Energy Consumption and Emissions
    energy_consumption_current = models.FloatField(blank=True, null=True,
                                                   help_text="Current energy consumption (kWh/m²)")
    energy_consumption_potential = models.FloatField(blank=True, null=True,
                                                     help_text="Potential energy consumption (kWh/m²)")
    co2_emissions_current = models.DecimalField(max_digits=10, decimal_places=2, blank=True, null=True,
                                                help_text="CO₂ emissions per year in tonnes/year")
    co2_emiss_curr_per_floor_area = models.DecimalField(max_digits=10, decimal_places=2, blank=True, null=True,
                                                        help_text="CO₂ emissions per m² per year in kg/m²")
    co2_emissions_potential = models.DecimalField(max_digits=10, decimal_places=2, blank=True, null=True,
                                                  help_text="Potential CO₂ emissions per year in tonnes/year")

    # Energy Costs
    lighting_cost_current = models.FloatField(blank=True, null=True, help_text="Current annual lighting costs (GBP)")
    lighting_cost_potential = models.FloatField(blank=True, null=True,
                                                help_text="Potential annual lighting costs (GBP)")
    heating_cost_current = models.FloatField(blank=True, null=True, help_text="Current annual heating costs (GBP)")
    heating_cost_potential = models.FloatField(blank=True, null=True, help_text="Potential annual heating costs (GBP)")
    hot_water_cost_current = models.FloatField(blank=True, null=True, help_text="Current annual hot water costs (GBP)")
    hot_water_cost_potential = models.FloatField(blank=True, null=True,
                                                 help_text="Potential annual hot water costs (GBP)")

    # Heating and Energy Systems
    main_fuel = models.CharField(max_length=100, blank=True, null=True, help_text="Type of fuel for central heating")
    main_heating_controls = models.CharField(max_length=100, blank=True, null=True,
                                             help_text="Type of main heating controls")
    energy_tariff = models.CharField(max_length=50, blank=True, null=True, help_text="Type of electricity tariff")
    mains_gas_flag = models.CharField(max_length=5, blank=True, null=True, help_text="Whether mains gas is available")

    # Building Features
    glazed_type = models.CharField(max_length=50, blank=True, null=True,
                                   help_text="Type of glazing (single, double, triple)")
    glazed_area = models.CharField(max_length=25, blank=True, null=True, help_text="Ranged estimate of glazed area")
    multi_glaze_proportion = models.FloatField(blank=True, null=True,
                                               help_text="Proportion of glazing that is multi-glazed")
    extension_count = models.IntegerField(blank=True, null=True, help_text="Number of extensions (0-4)")
    number_open_fireplaces = models.IntegerField(blank=True, null=True, help_text="Number of open fireplaces")

    # Lighting Information
    low_energy_lighting = models.IntegerField(blank=True, null=True,
                                              help_text="Percentage of low energy lighting present")
    fixed_lighting_outlets_count = models.FloatField(blank=True, null=True,
                                                     help_text="Number of fixed lighting outlets")
    low_energy_fixed_light_count = models.FloatField(blank=True, null=True,
                                                     help_text="Number of low-energy fixed lighting outlets")

    # Renewable Energy
    wind_turbine_count = models.FloatField(blank=True, null=True, help_text="Number of wind turbines")
    photo_supply = models.FloatField(blank=True, null=True,
                                     help_text="Percentage of photovoltaic area as percentage of roof area")
    solar_water_heating_flag = models.CharField(max_length=5, blank=True, null=True,
                                                help_text="Whether heating is solar powered")
    mechanical_ventilation = models.CharField(max_length=50, blank=True, null=True,
                                              help_text="Type of mechanical ventilation")

    # Component Descriptions and Ratings
    # Hot Water
    hotwater_description = models.CharField(max_length=255, blank=True, null=True)
    hot_water_energy_eff = models.CharField(max_length=20, choices=RATING_CHOICES, blank=True, null=True)
    hot_water_env_eff = models.CharField(max_length=20, choices=RATING_CHOICES, blank=True, null=True)

    # Floor
    floor_description = models.CharField(max_length=255, blank=True, null=True)
    floor_energy_eff = models.CharField(max_length=20, choices=RATING_CHOICES, blank=True, null=True)
    floor_env_eff = models.CharField(max_length=20, choices=RATING_CHOICES, blank=True, null=True)

    # Windows
    windows_description = models.CharField(max_length=255, blank=True, null=True)
    windows_energy_eff = models.CharField(max_length=20, choices=RATING_CHOICES, blank=True, null=True)
    windows_env_eff = models.CharField(max_length=20, choices=RATING_CHOICES, blank=True, null=True)

    # Walls
    walls_description = models.CharField(max_length=255, blank=True, null=True)
    walls_energy_eff = models.CharField(max_length=20, choices=RATING_CHOICES, blank=True, null=True)
    walls_env_eff = models.CharField(max_length=20, choices=RATING_CHOICES, blank=True, null=True)

    # Secondary Heating
    secondheat_description = models.CharField(max_length=255, blank=True, null=True)
    sheating_energy_eff = models.CharField(max_length=20, choices=RATING_CHOICES, blank=True, null=True)
    sheating_env_eff = models.CharField(max_length=20, choices=RATING_CHOICES, blank=True, null=True)

    # Roof
    roof_description = models.CharField(max_length=255, blank=True, null=True)
    roof_energy_eff = models.CharField(max_length=20, choices=RATING_CHOICES, blank=True, null=True)
    roof_env_eff = models.CharField(max_length=20, choices=RATING_CHOICES, blank=True, null=True)

    # Main Heating
    mainheat_description = models.CharField(max_length=255, blank=True, null=True)
    mainheat_energy_eff = models.CharField(max_length=20, choices=RATING_CHOICES, blank=True, null=True)
    mainheat_env_eff = models.CharField(max_length=20, choices=RATING_CHOICES, blank=True, null=True)

    # Main Heating Controls
    mainheatcont_description = models.CharField(max_length=255, blank=True, null=True)
    mainheatc_energy_eff = models.CharField(max_length=20, choices=RATING_CHOICES, blank=True, null=True)
    mainheatc_env_eff = models.CharField(max_length=20, choices=RATING_CHOICES, blank=True, null=True)

    # Lighting
    lighting_description = models.CharField(max_length=255, blank=True, null=True)
    lighting_energy_eff = models.CharField(max_length=20, choices=RATING_CHOICES, blank=True, null=True)
    lighting_env_eff = models.CharField(max_length=20, choices=RATING_CHOICES, blank=True, null=True)

    class Meta:
        verbose_name = "Energy Performance Certificate"
        verbose_name_plural = "Energy Performance Certificates"
        indexes = [
            models.Index(fields=['postcode']),
            models.Index(fields=['local_authority']),
            models.Index(fields=['current_energy_rating']),
            models.Index(fields=['inspection_date']),
            models.Index(fields=['lodgement_date']),
            models.Index(fields=['property_type']),
            models.Index(fields=['built_form']),
            models.Index(fields=['uprn']),
        ]

    def __str__(self):
        if self.address:
            return f"{self.address}, {self.postcode}"
        else:
            return f"Certificate {self.lmk_key}"


class Recommendation(models.Model):
    """
    Model representing improvement recommendations for an Energy Performance Certificate.
    Each recommendation is linked to a specific certificate.
    """
    certificate = models.ForeignKey(
        Certificate,
        on_delete=models.CASCADE,
        related_name='recommendations',
        to_field='lmk_key',
        db_column='lmk_key'
    )
    improvement_item = models.IntegerField(help_text="Order of the recommendation on the EPC")
    improvement_summary_text = models.CharField(max_length=255, help_text="Short description of the improvement")
    improvement_descr_text = models.TextField(help_text="Detailed description of the improvement")
    improvement_id = models.IntegerField(help_text="Code number for the improvement measure")
    improvement_id_text = models.CharField(max_length=255, help_text="Text associated with the improvement measure")
    indicative_cost = models.CharField(max_length=100, help_text="Indicative cost range for the improvement")

    class Meta:
        verbose_name = "Energy Improvement Recommendation"
        verbose_name_plural = "Energy Improvement Recommendations"
        ordering = ['certificate', 'improvement_item']
        unique_together = ['certificate', 'improvement_item']
        indexes = [
            models.Index(fields=['improvement_id']),
        ]

    def __str__(self):
        return f"{self.certificate.lmk_key} - {self.improvement_summary_text}"