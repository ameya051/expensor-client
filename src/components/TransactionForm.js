import { Autocomplete, Grid, Paper } from "@mui/material";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DesktopDatePicker } from "@mui/x-date-pickers/DesktopDatePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import Cookies from "js-cookie";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";

const InitialForm = {
  amount: 0,
  description: "",
  date: new Date(),
  category_id: "",
  type: "expenses",
};

export default function TransactionForm({
  fetchTransactions,
  editTransaction,
}) {
  const { categories } = useSelector((state) => state.auth.user);
  const token = Cookies.get("token");
  const [form, setForm] = useState(InitialForm);
  const types = ["expense", "income", "transfer"];

  useEffect(() => {
    if (editTransaction.amount !== undefined) {
      setForm(editTransaction);
    }
  }, [editTransaction]);

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  function handleDate(newValue) {
    setForm({ ...form, date: newValue });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    editTransaction.amount === undefined ? create() : update();
  }

  function reload(res) {
    if (res.ok) {
      setForm(InitialForm);
      fetchTransactions();
    }
  }

  async function create() {
    const res = await fetch(`${process.env.REACT_APP_API_URL}/transaction`, {
      method: "POST",
      body: JSON.stringify(form),
      headers: {
        "content-type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });
    reload(res);
  }

  async function update() {
    const res = await fetch(
      `${process.env.REACT_APP_API_URL}/transaction/${editTransaction._id}`,
      {
        method: "PATCH",
        body: JSON.stringify(form),
        headers: {
          "content-type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );
    reload(res);
  }

  function getCategoryNameById() {
    return (
      categories.find((category) => category._id === form.category_id) ?? ""
    );
  }

  return (
    <Box
      component="form"
      noValidate
      onSubmit={handleSubmit}
      sx={{ marginLeft: 2, marginTop: 6 }}
    >
      <Grid
        container
        spacing={2}
        component={Paper}
        sx={{ paddingBottom: 2, paddingRight: 2 }}
      >
        <Grid item xs={12}>
          <Typography variant="h6">Add New Transaction</Typography>
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            id="outlined-basic"
            label="Amount"
            type="number"
            name="amount"
            variant="outlined"
            value={form.amount}
            onChange={handleChange}
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <Autocomplete
            fullWidth
            value={form.type}
            onChange={(event, newValue) => {
              setForm({ ...form, type: newValue });
            }}
            id="type"
            options={types}
            renderInput={(params) => <TextField {...params} label="Type" />}
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <Autocomplete
            value={getCategoryNameById()}
            onChange={(event, newValue) => {
              setForm({ ...form, category_id: newValue._id });
            }}
            id="controllable-states-demo"
            options={categories}
            renderInput={(params) => <TextField {...params} label="Category" />}
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <DesktopDatePicker
              label="Transaction Date"
              inputFormat="MM/DD/YYYY"
              value={form.date}
              onChange={handleDate}
              renderInput={(params) => (
                <TextField sx={{ marginRight: 5 }} fullWidth {...params} />
              )}
            />
          </LocalizationProvider>
        </Grid>
        <Grid item xs={12}>
          <TextField
            fullWidth
            id="outlined-basic"
            label="Description"
            name="description"
            variant="outlined"
            value={form.description}
            onChange={handleChange}
          />
        </Grid>
        <Grid item xs={12}>
          {editTransaction.amount !== undefined && (
            <Button type="submit" variant="secondary">
              Update
            </Button>
          )}

          {editTransaction.amount === undefined && (
            <Button type="submit" variant="contained">
              Submit
            </Button>
          )}
        </Grid>
      </Grid>
    </Box>
  );
}
