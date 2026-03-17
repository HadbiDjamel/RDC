from django.db.models import Count, Q
from django.db.models.functions import ExtractYear
from registry.models import Tumor
import datetime

class TrendAnalyzer:
    """
    Utility to extract epidemiological trends from the registry database.
    Used by M.I.A. to provide data-driven insights.
    """

    @staticmethod
    def get_yearly_incidence(topo_code=None):
        """
        Returns number of cases per year. 
        If topo_code is provided, filters by that site (e.g. C50.9).
        """
        queryset = Tumor.objects.all()
        if topo_code:
            queryset = queryset.filter(topo_code__icontains=topo_code)
        
        years = {}
        for tumor in queryset:
            try:
                # Robust parsing for DD/MM/YYYY or YYYY-MM-DD
                date_str = tumor.incidence_date
                if '-' in date_str:
                    year = date_str.split('-')[0] if len(date_str.split('-')[0]) == 4 else date_str.split('-')[-1]
                elif '/' in date_str:
                    year = date_str.split('/')[-1] if len(date_str.split('/')[-1]) == 4 else date_str.split('/')[0]
                else:
                    year = date_str[:4] # Fallback
                
                years[year] = years.get(year, 0) + 1
            except:
                continue
        
        # Sort by year
        sorted_years = sorted(years.items())
        return [{"year": y, "count": c} for y, c in sorted_years if len(y) == 4]

    @staticmethod
    def get_top_cancers(limit=5):
        """
        Returns the most frequent topography codes.
        """
        stats = Tumor.objects.values('topo_code').annotate(count=Count('topo_code')).order_by('-count')[:limit]
        return list(stats)

    @staticmethod
    def get_wilaya_distribution():
        """
        Returns distribution of cases by Wilaya.
        """
        stats = Tumor.objects.values('patient__wilaya__name').annotate(count=Count('id')).order_by('-count')
        return [{"wilaya": s['patient__wilaya__name'], "count": s['count']} for s in stats if s['patient__wilaya__name']]

    @staticmethod
    def get_summary_stats():
        """
        Returns a high-level summary for system prompt injection.
        """
        total = Tumor.objects.count()
        top = TrendAnalyzer.get_top_cancers(limit=3)
        top_str = ", ".join([f"{s['topo_code']} ({s['count']} cas)" for s in top])
        
        return {
            "total_cases": total,
            "top_sites": top_str,
            "last_update": datetime.datetime.now().strftime("%Y-%m-%d")
        }
