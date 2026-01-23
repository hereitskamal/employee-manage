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

    (async () => {
      setLoading(true);
      const res = await fetch(`/api/employees/${id}`);
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
