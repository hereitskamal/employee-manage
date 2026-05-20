import { useEffect, useState } from "react";
import { EmployeeRow } from "../types/employee";

export default function useEmployee(id: string | null) {
  const [employee, setEmployee] = useState<EmployeeRow | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!id) {
      setEmployee(null);
      return;
    }

    // Extract the actual ID if it includes query params (for refresh)
    const actualId = id.split('?')[0];

    (async () => {
      setLoading(true);
      const res = await fetch(`/api/employees/${actualId}`);
      const data = await res.json();
      
      if (res.ok && data.success && data.data) {
        setEmployee(data.data);
      } else {
        setEmployee(null);
      }
      setLoading(false);
    })();
  }, [id]);

  return { employee, loading };
}
