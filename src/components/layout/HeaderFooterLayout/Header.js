"use client";

import * as React from "react";
import AppBar from "@mui/material/AppBar";
import Box from "@mui/material/Box";
import Toolbar from "@mui/material/Toolbar";
import IconButton from "@mui/material/IconButton";
import Typography from "@mui/material/Typography";
import Menu from "@mui/material/Menu";
import Container from "@mui/material/Container";
import Avatar from "@mui/material/Avatar";
import Button from "@mui/material/Button";
import Tooltip from "@mui/material/Tooltip";
import MenuItem from "@mui/material/MenuItem";
import { MdAndroid, MdMenu } from "react-icons/md";
import "./Header.css";

const pages = ["Products", "Pricing", "Blog"];
const settings = ["Profile", "Account", "Dashboard", "Logout"];

function Header() {
  const [anchorElNav, setAnchorElNav] = React.useState(null);
  const [anchorElUser, setAnchorElUser] = React.useState(null);

  const handleOpenNavMenu = (event) => {
    setAnchorElNav(event.currentTarget);
  };
  const handleOpenUserMenu = (event) => {
    setAnchorElUser(event.currentTarget);
  };

  const handleCloseNavMenu = () => {
    setAnchorElNav(null);
  };

  const handleCloseUserMenu = () => {
    setAnchorElUser(null);
  };

  return (
    <AppBar position="sticky">
      <Container maxWidth={false}>
        <Toolbar
          disableGutters
          sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}
        >
          {/* Left: Logo */}
          <Box sx={{ display: "flex", alignItems: "center", gap: 1, lineHeight: 0 }}>
            <MdAndroid size={22} aria-hidden />
            <Typography
              variant="h6"
              noWrap
              component="a" 
              className="card-tag white"
            >
              LOGO Here
            </Typography>
          </Box>

          {/* Right: Desktop links + user menu */}
          <Box >
            <Button
              className="card-button"
            >
              Login
            </Button>
          </Box>


        </Toolbar>
      </Container>
    </AppBar>
  );
}
export default Header;
