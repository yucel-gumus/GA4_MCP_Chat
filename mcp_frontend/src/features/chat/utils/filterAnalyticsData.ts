export function filterAnalyticsData(data: any) {
  if (!data || !data.rows) return data;

  return {
    ...data,
    rows: data.rows.filter((row: any) =>
      row.dimension_values.every(
        (dim: any) => dim.value && dim.value !== "(not set)"
      )
    )
  };
}
