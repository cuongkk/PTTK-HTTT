-- ============================================================
-- HOMESTAY DORM – Full Database Script (PostgreSQL)
-- Thứ tự tạo bảng theo dependency
-- ============================================================

CREATE DATABASE homestay_dorm
    ENCODING   'UTF8'
    TEMPLATE   template0;

\c homestay_dorm;

-- ============================================================
-- 1. chi_nhanh
-- ============================================================
CREATE TABLE chi_nhanh (
    ma_chi_nhanh  CHAR(10)     NOT NULL,
    ten_chi_nhanh VARCHAR(100) NOT NULL,
    dia_chi       VARCHAR(200) NOT NULL,
    so_dien_thoai VARCHAR(15),
    email         VARCHAR(100),
    CONSTRAINT pk_chi_nhanh PRIMARY KEY (ma_chi_nhanh)
);

-- ============================================================
-- 2. phong  → chi_nhanh
-- ============================================================
CREATE TABLE phong (
    ma_phong      CHAR(10)     NOT NULL,
    ma_chi_nhanh  CHAR(10)     NOT NULL,
    ten_phong     VARCHAR(50)  NOT NULL,
    loai_phong    VARCHAR(30)  NOT NULL,  -- nguyen_can | ghep
    suc_chua      SMALLINT     NOT NULL,
    khu_vuc       VARCHAR(50),
    gia_phong     NUMERIC(12,2),
    co_dieu_hoa   BOOLEAN      DEFAULT FALSE,
    co_gui_xe     BOOLEAN      DEFAULT FALSE,
    trang_thai    VARCHAR(20)  NOT NULL DEFAULT 'trong',
    -- Audit: UC Quản lý danh mục phòng/giường (System Admin)
    ngay_cap_nhat TIMESTAMP,
    ma_nguoi_sua  CHAR(12),          -- FK → tai_khoan.ma_tai_khoan (thêm sau)
    CONSTRAINT pk_phong            PRIMARY KEY (ma_phong),
    CONSTRAINT fk_phong_chinhanh   FOREIGN KEY (ma_chi_nhanh)
        REFERENCES chi_nhanh(ma_chi_nhanh) ON UPDATE CASCADE ON DELETE RESTRICT,
    CONSTRAINT chk_phong_suc_chua  CHECK (suc_chua > 0),
    CONSTRAINT chk_phong_trangthai CHECK (trang_thai IN ('trong','da_dat_coc','dang_thue','bao_tri'))
);

-- ============================================================
-- 3. giuong  → phong
-- ============================================================
CREATE TABLE giuong (
    ma_giuong      CHAR(12)      NOT NULL,
    ma_phong       CHAR(10)      NOT NULL,
    so_thu_tu      SMALLINT      NOT NULL,
    gia_thue_thang NUMERIC(12,2) NOT NULL,
    trang_thai     VARCHAR(20)   NOT NULL DEFAULT 'trong',
    -- Audit: UC Quản lý danh mục phòng/giường (System Admin)
    ngay_cap_nhat  TIMESTAMP,
    ma_nguoi_sua   CHAR(12),          -- FK → tai_khoan.ma_tai_khoan (thêm sau)
    CONSTRAINT pk_giuong            PRIMARY KEY (ma_giuong),
    CONSTRAINT fk_giuong_phong      FOREIGN KEY (ma_phong)
        REFERENCES phong(ma_phong) ON UPDATE CASCADE ON DELETE RESTRICT,
    CONSTRAINT uq_giuong_phong_stt  UNIQUE (ma_phong, so_thu_tu),
    CONSTRAINT chk_giuong_gia       CHECK (gia_thue_thang > 0),
    CONSTRAINT chk_giuong_trangthai CHECK (trang_thai IN ('trong','da_dat_coc','dang_thue','bao_tri'))
);

-- ============================================================
-- 4. tai_san  → phong
-- ============================================================
CREATE TABLE tai_san (
    ma_tai_san  CHAR(12)     NOT NULL,
    ma_phong    CHAR(10)     NOT NULL,
    ten_tai_san VARCHAR(100) NOT NULL,
    mo_ta       TEXT,
    tinh_trang  VARCHAR(50)  DEFAULT 'tot',
    CONSTRAINT pk_tai_san      PRIMARY KEY (ma_tai_san),
    CONSTRAINT fk_taisan_phong FOREIGN KEY (ma_phong)
        REFERENCES phong(ma_phong) ON UPDATE CASCADE ON DELETE RESTRICT
);

-- ============================================================
-- 5. nhan_vien  → chi_nhanh
-- ============================================================
CREATE TABLE nhan_vien (
    ma_nv         CHAR(10)     NOT NULL,
    ma_chi_nhanh  CHAR(10),
    ho_ten        VARCHAR(100) NOT NULL,
    so_dien_thoai VARCHAR(15),
    email         VARCHAR(100),
    vai_tro       VARCHAR(20)  NOT NULL,  -- sale | quan_ly | ke_toan | system_admin
    ngay_vao_lam  DATE,
    is_active     BOOLEAN      DEFAULT TRUE,
    CONSTRAINT pk_nhan_vien       PRIMARY KEY (ma_nv),
    CONSTRAINT uq_nhanvien_email  UNIQUE (email),
    CONSTRAINT fk_nhanvien_chinhanh FOREIGN KEY (ma_chi_nhanh)
        REFERENCES chi_nhanh(ma_chi_nhanh) ON UPDATE CASCADE ON DELETE SET NULL,
    CONSTRAINT chk_nhanvien_vaitro CHECK (vai_tro IN ('sale','quan_ly','ke_toan','system_admin'))
);

-- ============================================================
-- 6. khach_hang  (độc lập)
-- ============================================================
CREATE TABLE khach_hang (
    ma_kh         CHAR(12)     NOT NULL,
    ho_ten        VARCHAR(100) NOT NULL,
    cccd          VARCHAR(20)  NOT NULL,
    so_dien_thoai VARCHAR(15)  NOT NULL,
    email         VARCHAR(100),
    gioi_tinh     CHAR(3),
    quoc_tich     VARCHAR(50)  DEFAULT 'Việt Nam',
    ngay_sinh     DATE,
    dia_chi       VARCHAR(200),
    ngay_tao      TIMESTAMP    DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT pk_khach_hang   PRIMARY KEY (ma_kh),
    CONSTRAINT uq_kh_cccd      UNIQUE (cccd),
    CONSTRAINT chk_kh_gioitinh CHECK (gioi_tinh IN ('Nam','Nu'))
);

-- ============================================================
-- 7. ho_so_dang_ky  → khach_hang, nhan_vien
-- ============================================================
-- ============================================================
-- 6b. vai_tro_he_thong
-- ============================================================
CREATE TABLE vai_tro_he_thong (
    ma_vai_tro  VARCHAR(30)  NOT NULL,
    ten_vai_tro VARCHAR(100) NOT NULL,
    mo_ta       TEXT,
    CONSTRAINT pk_vai_tro_he_thong PRIMARY KEY (ma_vai_tro)
);

-- ============================================================
-- 6c. quyen_he_thong
-- ============================================================
CREATE TABLE quyen_he_thong (
    ma_quyen  VARCHAR(50)  NOT NULL,
    ten_quyen VARCHAR(100) NOT NULL,
    mo_ta     TEXT,
    CONSTRAINT pk_quyen_he_thong PRIMARY KEY (ma_quyen)
);

-- ============================================================
-- 6d. vai_tro_quyen  (N-N)
-- ============================================================
CREATE TABLE vai_tro_quyen (
    ma_vai_tro VARCHAR(30) NOT NULL,
    ma_quyen   VARCHAR(50) NOT NULL,
    CONSTRAINT pk_vai_tro_quyen PRIMARY KEY (ma_vai_tro, ma_quyen),
    CONSTRAINT fk_vtq_vaitro FOREIGN KEY (ma_vai_tro)
        REFERENCES vai_tro_he_thong(ma_vai_tro) ON UPDATE CASCADE ON DELETE CASCADE,
    CONSTRAINT fk_vtq_quyen FOREIGN KEY (ma_quyen)
        REFERENCES quyen_he_thong(ma_quyen) ON UPDATE CASCADE ON DELETE CASCADE
);

-- ============================================================
-- 6e. tai_khoan  -> nhan_vien, khach_hang, vai_tro_he_thong
-- ============================================================
CREATE TABLE tai_khoan (
    ma_tai_khoan            CHAR(12)     NOT NULL,
    ten_dang_nhap           VARCHAR(50)  NOT NULL,
    mat_khau_hash           VARCHAR(255) NOT NULL,
    ma_vai_tro              VARCHAR(30)  NOT NULL,
    ma_nv                   CHAR(10),
    ma_kh                   CHAR(12),
    email_xac_thuc          VARCHAR(100),
    trang_thai              VARCHAR(20)  NOT NULL DEFAULT 'kich_hoat',
    lan_dang_nhap_cuoi      TIMESTAMP,
    ngay_tao                TIMESTAMP    DEFAULT CURRENT_TIMESTAMP,
    ngay_cap_nhat           TIMESTAMP,
    ma_nguoi_tao            CHAR(12),                           -- lý do khóa/vô hiệu hóa tài khoản
    -- Đặt lại mật khẩu: UC Quản trị người dùng
    reset_token_hash        VARCHAR(255),                     -- token reset mật khẩu (đã hash)
    reset_token_het_han     TIMESTAMP,                        -- thời hạn token reset
    CONSTRAINT pk_tai_khoan PRIMARY KEY (ma_tai_khoan),
    CONSTRAINT uq_taikhoan_username UNIQUE (ten_dang_nhap),
    CONSTRAINT uq_taikhoan_nv UNIQUE (ma_nv),
    CONSTRAINT uq_taikhoan_kh UNIQUE (ma_kh),
    CONSTRAINT fk_taikhoan_vaitro FOREIGN KEY (ma_vai_tro)
        REFERENCES vai_tro_he_thong(ma_vai_tro) ON UPDATE CASCADE ON DELETE RESTRICT,
    CONSTRAINT fk_taikhoan_nv FOREIGN KEY (ma_nv)
        REFERENCES nhan_vien(ma_nv) ON UPDATE CASCADE ON DELETE CASCADE,
    CONSTRAINT fk_taikhoan_kh FOREIGN KEY (ma_kh)
        REFERENCES khach_hang(ma_kh) ON UPDATE CASCADE ON DELETE CASCADE,
    CONSTRAINT fk_taikhoan_nguoitao FOREIGN KEY (ma_nguoi_tao)
        REFERENCES tai_khoan(ma_tai_khoan) ON UPDATE CASCADE ON DELETE SET NULL,
    CONSTRAINT chk_taikhoan_chusohuu CHECK (
        (ma_nv IS NOT NULL AND ma_kh IS NULL)
        OR (ma_nv IS NULL AND ma_kh IS NOT NULL)
    ),
    CONSTRAINT chk_taikhoan_trangthai CHECK (trang_thai IN ('kich_hoat','khoa','vo_hieu_hoa'))
);


-- ============================================================
-- 6g. tham_so_he_thong  -> tai_khoan
-- ============================================================
CREATE TABLE tham_so_he_thong (
    ma_tham_so     VARCHAR(50)  NOT NULL,
    ten_tham_so    VARCHAR(100) NOT NULL,
    nhom_tham_so   VARCHAR(50)  NOT NULL,
    gia_tri        TEXT         NOT NULL,
    kieu_du_lieu   VARCHAR(20)  NOT NULL,
    mo_ta          TEXT,
    is_active      BOOLEAN      DEFAULT TRUE,
    ngay_cap_nhat  TIMESTAMP,
    ma_nguoi_sua   CHAR(12),
    CONSTRAINT pk_tham_so_he_thong PRIMARY KEY (ma_tham_so),
    CONSTRAINT fk_thamso_nguoisua FOREIGN KEY (ma_nguoi_sua)
        REFERENCES tai_khoan(ma_tai_khoan) ON UPDATE CASCADE ON DELETE SET NULL,
    CONSTRAINT chk_thamso_kieudulieu CHECK (kieu_du_lieu IN ('string','number','boolean','json','time'))
);

-- ============================================================
-- 6h. dich_vu  -> tai_khoan
-- ============================================================
CREATE TABLE dich_vu (
    ma_dich_vu    CHAR(12)      NOT NULL,
    ten_dich_vu   VARCHAR(100)  NOT NULL,
    loai_dich_vu  VARCHAR(30)   NOT NULL,
    don_vi_tinh   VARCHAR(30)   NOT NULL,
    don_gia       NUMERIC(12,2) NOT NULL,
    mo_ta         TEXT,
    is_active     BOOLEAN       DEFAULT TRUE,
    ngay_cap_nhat TIMESTAMP,
    ma_nguoi_sua  CHAR(12),
    CONSTRAINT pk_dich_vu PRIMARY KEY (ma_dich_vu),
    CONSTRAINT uq_dichvu_ten UNIQUE (ten_dich_vu),
    CONSTRAINT fk_dichvu_nguoisua FOREIGN KEY (ma_nguoi_sua)
        REFERENCES tai_khoan(ma_tai_khoan) ON UPDATE CASCADE ON DELETE SET NULL,
    CONSTRAINT chk_dichvu_loai CHECK (loai_dich_vu IN ('dien','nuoc','wifi','ve_sinh','khac')),
    CONSTRAINT chk_dichvu_dongia CHECK (don_gia >= 0)
);

CREATE TABLE ho_so_dang_ky (
    ma_ho_so            CHAR(12)     NOT NULL,
    ma_kh               CHAR(12)     NOT NULL,
    ma_sale             CHAR(10),
    so_nguoi            SMALLINT     NOT NULL,
    thoi_gian_du_kien_thue DATE,
    yeu_cau_khac        TEXT,
    trang_thai          VARCHAR(20)  DEFAULT 'moi',
    ngay_tao            TIMESTAMP    DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT pk_ho_so          PRIMARY KEY (ma_ho_so),
    CONSTRAINT fk_hoso_kh        FOREIGN KEY (ma_kh)
        REFERENCES khach_hang(ma_kh)   ON UPDATE CASCADE ON DELETE RESTRICT,
    CONSTRAINT fk_hoso_sale      FOREIGN KEY (ma_sale)
        REFERENCES nhan_vien(ma_nv)    ON UPDATE CASCADE ON DELETE SET NULL,
    CONSTRAINT chk_hoso_songuoi   CHECK (so_nguoi > 0),
    CONSTRAINT chk_hoso_trangthai CHECK (trang_thai IN ('moi','da_xem_phong','da_dat_coc','huy'))
);

-- ============================================================
-- 8. lich_xem_phong  → ho_so_dang_ky, nhan_vien
-- ============================================================
CREATE TABLE lich_xem_phong (
    ma_lich      CHAR(12)  NOT NULL,
    ma_ho_so     CHAR(12)  NOT NULL,
    ma_sale      CHAR(10)  NOT NULL,
    ngay_gio_hen TIMESTAMP NOT NULL,
    trang_thai   VARCHAR(20) DEFAULT 'sap_den',
    ghi_chu      TEXT,
    CONSTRAINT pk_lich_xem        PRIMARY KEY (ma_lich),
    CONSTRAINT fk_lichxem_hoso    FOREIGN KEY (ma_ho_so)
        REFERENCES ho_so_dang_ky(ma_ho_so) ON UPDATE CASCADE ON DELETE CASCADE,
    CONSTRAINT fk_lichxem_sale    FOREIGN KEY (ma_sale)
        REFERENCES nhan_vien(ma_nv)        ON UPDATE CASCADE ON DELETE RESTRICT,
    CONSTRAINT chk_lich_trangthai CHECK (trang_thai IN ('sap_den','hoan_thanh','huy'))
);

-- 8b. Pivot: lịch xem phòng ↔ phòng  (N-N)
CREATE TABLE lich_xem_phong_phong (
    ma_lich  CHAR(12) NOT NULL,
    ma_phong CHAR(10) NOT NULL,
    CONSTRAINT pk_lxp       PRIMARY KEY (ma_lich, ma_phong),
    CONSTRAINT fk_lxp_lich  FOREIGN KEY (ma_lich)
        REFERENCES lich_xem_phong(ma_lich) ON UPDATE CASCADE ON DELETE CASCADE,
    CONSTRAINT fk_lxp_phong FOREIGN KEY (ma_phong)
        REFERENCES phong(ma_phong)         ON UPDATE CASCADE ON DELETE RESTRICT
);

-- ============================================================
-- 9. phieu_dat_coc  → ho_so_dang_ky, nhan_vien(×2)
-- ============================================================
CREATE TABLE phieu_dat_coc (
    ma_coc          CHAR(12)      NOT NULL,
    ma_ho_so        CHAR(12)      NOT NULL,
    ma_sale         CHAR(10)      NOT NULL,
    ma_quan_ly      CHAR(10),
    so_tien_coc     NUMERIC(12,2) NOT NULL,  -- = gia_thue x 2 x so_giuong
    ngay_lap        TIMESTAMP     DEFAULT CURRENT_TIMESTAMP,
    han_thanh_toan  TIMESTAMP     NOT NULL,  -- ngay_lap + 24h
    ngay_thanh_toan TIMESTAMP,
    trang_thai      VARCHAR(20)   DEFAULT 'cho_thanh_toan',
    CONSTRAINT pk_phieu_coc      PRIMARY KEY (ma_coc),
    CONSTRAINT fk_coc_hoso       FOREIGN KEY (ma_ho_so)
        REFERENCES ho_so_dang_ky(ma_ho_so) ON UPDATE CASCADE ON DELETE RESTRICT,
    CONSTRAINT fk_coc_sale       FOREIGN KEY (ma_sale)
        REFERENCES nhan_vien(ma_nv)        ON UPDATE CASCADE ON DELETE RESTRICT,
    CONSTRAINT fk_coc_quanly     FOREIGN KEY (ma_quan_ly)
        REFERENCES nhan_vien(ma_nv)        ON UPDATE CASCADE ON DELETE SET NULL,
    CONSTRAINT chk_coc_sotien    CHECK (so_tien_coc > 0),
    CONSTRAINT chk_coc_trangthai CHECK (trang_thai IN ('cho_thanh_toan','hoan_thanh','het_han','huy'))
);

-- 9b. Pivot: phiếu cọc ↔ giường  (N-N)
CREATE TABLE dat_coc_giuong (
    ma_coc    CHAR(12) NOT NULL,
    ma_giuong CHAR(12) NOT NULL,
    CONSTRAINT pk_dcg         PRIMARY KEY (ma_coc, ma_giuong),
    CONSTRAINT fk_dcg_coc     FOREIGN KEY (ma_coc)
        REFERENCES phieu_dat_coc(ma_coc) ON UPDATE CASCADE ON DELETE CASCADE,
    CONSTRAINT fk_dcg_giuong  FOREIGN KEY (ma_giuong)
        REFERENCES giuong(ma_giuong)     ON UPDATE CASCADE ON DELETE RESTRICT
);

-- ============================================================
-- 10. hop_dong_thue  → phieu_dat_coc, khach_hang, nhan_vien, phong
-- ============================================================
CREATE TABLE hop_dong_thue (
    ma_hop_dong      CHAR(12)      NOT NULL,
    ma_coc           CHAR(12)      NOT NULL,
    ma_kh            CHAR(12)      NOT NULL,
    ma_sale          CHAR(10)      NOT NULL,
    ma_phong         CHAR(10)      NOT NULL,
    so_giuong_thue   SMALLINT      NOT NULL,
    gia_thue_thang   NUMERIC(12,2) NOT NULL,
    ky_thanh_toan    VARCHAR(20)   DEFAULT 'hang_thang',
    ngay_ky          DATE          NOT NULL,
    ngay_bat_dau     DATE          NOT NULL,
    ngay_ket_thuc    DATE,
    trang_thai       VARCHAR(20)   DEFAULT 'hieu_luc',
    CONSTRAINT pk_hop_dong       PRIMARY KEY (ma_hop_dong),
    CONSTRAINT uq_hopdong_coc    UNIQUE (ma_coc),
    CONSTRAINT fk_hd_coc         FOREIGN KEY (ma_coc)
        REFERENCES phieu_dat_coc(ma_coc) ON UPDATE CASCADE ON DELETE RESTRICT,
    CONSTRAINT fk_hd_kh          FOREIGN KEY (ma_kh)
        REFERENCES khach_hang(ma_kh)     ON UPDATE CASCADE ON DELETE RESTRICT,
    CONSTRAINT fk_hd_sale        FOREIGN KEY (ma_sale)
        REFERENCES nhan_vien(ma_nv)      ON UPDATE CASCADE ON DELETE RESTRICT,
    CONSTRAINT fk_hd_phong       FOREIGN KEY (ma_phong)
        REFERENCES phong(ma_phong)       ON UPDATE CASCADE ON DELETE RESTRICT,
    CONSTRAINT chk_hd_trangthai  CHECK (trang_thai IN ('hieu_luc','het_han','thanh_ly'))
);

-- ============================================================
-- 11. thanh_vien_thue  → khach_hang, hop_dong_thue
-- ============================================================
CREATE TABLE thanh_vien_thue (
    ma_tv         CHAR(12)     NOT NULL,
    ma_kh         CHAR(12),
    ma_hop_dong   CHAR(12),
    ho_ten        VARCHAR(100) NOT NULL,
    cccd          VARCHAR(20),
    gioi_tinh     CHAR(3),
    ngay_sinh     DATE,
    dat_dieu_kien BOOLEAN      DEFAULT TRUE,
    ghi_chu       TEXT,
    CONSTRAINT pk_thanh_vien    PRIMARY KEY (ma_tv),
    CONSTRAINT fk_tv_kh         FOREIGN KEY (ma_kh)
        REFERENCES khach_hang(ma_kh)       ON UPDATE CASCADE ON DELETE SET NULL,
    CONSTRAINT fk_tv_hopdong    FOREIGN KEY (ma_hop_dong)
        REFERENCES hop_dong_thue(ma_hop_dong) ON UPDATE CASCADE ON DELETE CASCADE,
    CONSTRAINT chk_tv_gioitinh  CHECK (gioi_tinh IN ('Nam','Nu'))
);

-- ============================================================
-- 12. bien_ban_ban_giao  → hop_dong_thue, nhan_vien
-- ============================================================
CREATE TABLE bien_ban_ban_giao (
    ma_bb            CHAR(12)  NOT NULL,
    ma_hop_dong      CHAR(12)  NOT NULL,
    ma_quan_ly       CHAR(10)  NOT NULL,
    ngay_ban_giao    DATE      NOT NULL,
    tinh_trang_phong TEXT,
    ghi_chu          TEXT,
    CONSTRAINT pk_bbgiao       PRIMARY KEY (ma_bb),
    CONSTRAINT uq_bbgiao_hd    UNIQUE (ma_hop_dong),
    CONSTRAINT fk_bbgiao_hd    FOREIGN KEY (ma_hop_dong)
        REFERENCES hop_dong_thue(ma_hop_dong) ON UPDATE CASCADE ON DELETE RESTRICT,
    CONSTRAINT fk_bbgiao_ql    FOREIGN KEY (ma_quan_ly)
        REFERENCES nhan_vien(ma_nv)           ON UPDATE CASCADE ON DELETE RESTRICT
);

-- ============================================================
-- 13. chi_tiet_ban_giao  → bien_ban_ban_giao, tai_san
-- ============================================================
CREATE TABLE chi_tiet_ban_giao (
    ma_bb      CHAR(12)  NOT NULL,
    ma_tai_san CHAR(12)  NOT NULL,
    so_luong   SMALLINT  DEFAULT 1,
    tinh_trang VARCHAR(50),
    ghi_chu    TEXT,
    CONSTRAINT pk_ctbg          PRIMARY KEY (ma_bb, ma_tai_san),
    CONSTRAINT fk_ctbg_bb       FOREIGN KEY (ma_bb)
        REFERENCES bien_ban_ban_giao(ma_bb) ON UPDATE CASCADE ON DELETE CASCADE,
    CONSTRAINT fk_ctbg_taisan   FOREIGN KEY (ma_tai_san)
        REFERENCES tai_san(ma_tai_san)      ON UPDATE CASCADE ON DELETE RESTRICT
);

-- ============================================================
-- 14. bang_doi_soat  → hop_dong_thue, nhan_vien(×2)
-- ============================================================
CREATE TABLE bang_doi_soat (
    ma_doi_soat         CHAR(12)      NOT NULL,
    ma_hop_dong         CHAR(12)      NOT NULL,
    ma_ke_toan          CHAR(10)      NOT NULL,
    ma_quan_ly          CHAR(10),
    ngay_lap            DATE          NOT NULL,
    ty_le_hoan          NUMERIC(5,2)  NOT NULL,  -- 50 | 70 | 80 | 100
    so_tien_coc_goc     NUMERIC(12,2) NOT NULL,
    so_tien_hoan_co_ban NUMERIC(12,2) NOT NULL,
    tong_khau_tru       NUMERIC(12,2) DEFAULT 0,
    so_tien_hoan        NUMERIC(12,2),  -- > 0: hoàn cho khách
    so_tien_thu_them    NUMERIC(12,2),  -- > 0: khách nộp thêm
    trang_thai          VARCHAR(20)   DEFAULT 'cho_xac_nhan',
    CONSTRAINT pk_doi_soat       PRIMARY KEY (ma_doi_soat),
    CONSTRAINT uq_doisoat_hd     UNIQUE (ma_hop_dong),
    CONSTRAINT fk_ds_hopdong     FOREIGN KEY (ma_hop_dong)
        REFERENCES hop_dong_thue(ma_hop_dong) ON UPDATE CASCADE ON DELETE RESTRICT,
    CONSTRAINT fk_ds_ketoan      FOREIGN KEY (ma_ke_toan)
        REFERENCES nhan_vien(ma_nv)           ON UPDATE CASCADE ON DELETE RESTRICT,
    CONSTRAINT fk_ds_quanly      FOREIGN KEY (ma_quan_ly)
        REFERENCES nhan_vien(ma_nv)           ON UPDATE CASCADE ON DELETE SET NULL,
    CONSTRAINT chk_ds_tyle       CHECK (ty_le_hoan IN (50, 70, 80, 100)),
    CONSTRAINT chk_ds_trangthai  CHECK (trang_thai IN ('cho_xac_nhan','da_xac_nhan','hoan_tat'))
);

-- ============================================================
-- 15. chi_phi_phat_sinh  → bang_doi_soat
-- ============================================================
CREATE TABLE chi_phi_phat_sinh (
    ma_chi_phi   CHAR(12)      NOT NULL,
    ma_doi_soat  CHAR(12)      NOT NULL,
    loai_chi_phi VARCHAR(30)   NOT NULL,
    so_tien      NUMERIC(12,2) NOT NULL,
    mo_ta        TEXT,
    CONSTRAINT pk_cpps         PRIMARY KEY (ma_chi_phi),
    CONSTRAINT fk_cpps_doisoat FOREIGN KEY (ma_doi_soat)
        REFERENCES bang_doi_soat(ma_doi_soat) ON UPDATE CASCADE ON DELETE CASCADE,
    CONSTRAINT chk_cpps_loai   CHECK (loai_chi_phi IN ('no_tien_thue','dien_nuoc','hu_hong','phat_vi_pham','khac')),
    CONSTRAINT chk_cpps_sotien CHECK (so_tien >= 0)
);

-- ============================================================
-- 16. bien_ban_tra_phong  → bang_doi_soat, nhan_vien
-- ============================================================
CREATE TABLE bien_ban_tra_phong (
    ma_bb_tra        CHAR(12)  NOT NULL,
    ma_doi_soat      CHAR(12)  NOT NULL,
    ma_quan_ly       CHAR(10)  NOT NULL,
    ngay_tra         DATE      NOT NULL,
    tinh_trang_phong TEXT,
    da_thu_khoa      BOOLEAN   DEFAULT FALSE,
    ghi_chu          TEXT,
    CONSTRAINT pk_bbtra         PRIMARY KEY (ma_bb_tra),
    CONSTRAINT uq_bbtra_doisoat UNIQUE (ma_doi_soat),
    CONSTRAINT fk_bbtra_doisoat FOREIGN KEY (ma_doi_soat)
        REFERENCES bang_doi_soat(ma_doi_soat) ON UPDATE CASCADE ON DELETE RESTRICT,
    CONSTRAINT fk_bbtra_quanly  FOREIGN KEY (ma_quan_ly)
        REFERENCES nhan_vien(ma_nv)           ON UPDATE CASCADE ON DELETE RESTRICT
);

-- ============================================================
-- 17. hoa_don  → khach_hang, nhan_vien, phieu_dat_coc,
--               hop_dong_thue, bang_doi_soat  (dùng chung)
-- ============================================================
CREATE TABLE hoa_don (
    ma_hoa_don      CHAR(12)      NOT NULL,
    ma_kh           CHAR(12)      NOT NULL,
    ma_ke_toan      CHAR(10),
    -- Chỉ 1 trong 3 FK bên dưới có giá trị tại một thời điểm
    ma_coc          CHAR(12),
    ma_hop_dong     CHAR(12),
    ma_doi_soat     CHAR(12),
    loai_hoa_don    VARCHAR(20)   NOT NULL,
    loai_chung_tu   VARCHAR(10)   DEFAULT 'thu', -- thu | chi
    tong_tien       NUMERIC(12,2) NOT NULL,
    phuong_thuc     VARCHAR(20)   DEFAULT 'chuyen_khoan',
    ten_ngan_hang   VARCHAR(100),
    so_tai_khoan    VARCHAR(50),
    chu_tai_khoan   VARCHAR(100),
    ma_giao_dich    VARCHAR(100),
    anh_minh_chung  TEXT,
    ngay_lap        TIMESTAMP     DEFAULT CURRENT_TIMESTAMP,
    ngay_thanh_toan TIMESTAMP,
    trang_thai      VARCHAR(20)   DEFAULT 'cho_thanh_toan',
    ky_thanh_toan   DATE,  -- kỳ thuê tương ứng (nếu loại tien_thue)
    ghi_chu         TEXT,
    CONSTRAINT pk_hoa_don        PRIMARY KEY (ma_hoa_don),
    CONSTRAINT fk_hd2_kh         FOREIGN KEY (ma_kh)
        REFERENCES khach_hang(ma_kh)          ON UPDATE CASCADE ON DELETE RESTRICT,
    CONSTRAINT fk_hd2_ketoan     FOREIGN KEY (ma_ke_toan)
        REFERENCES nhan_vien(ma_nv)            ON UPDATE CASCADE ON DELETE SET NULL,
    CONSTRAINT fk_hd2_coc        FOREIGN KEY (ma_coc)
        REFERENCES phieu_dat_coc(ma_coc)       ON UPDATE CASCADE ON DELETE SET NULL,
    CONSTRAINT fk_hd2_hopdong    FOREIGN KEY (ma_hop_dong)
        REFERENCES hop_dong_thue(ma_hop_dong)  ON UPDATE CASCADE ON DELETE SET NULL,
    CONSTRAINT fk_hd2_doisoat    FOREIGN KEY (ma_doi_soat)
        REFERENCES bang_doi_soat(ma_doi_soat)  ON UPDATE CASCADE ON DELETE SET NULL,
    CONSTRAINT chk_hd2_loai      CHECK (loai_hoa_don IN ('tien_coc','tien_thue','dich_vu','hoan_coc','thu_them')),
    CONSTRAINT chk_hd2_chungtu   CHECK (loai_chung_tu IN ('thu','chi')),
    CONSTRAINT chk_hd2_pt        CHECK (phuong_thuc  IN ('tien_mat','chuyen_khoan')),
    CONSTRAINT chk_hd2_trangthai CHECK (trang_thai   IN ('cho_thanh_toan','da_thanh_toan','huy'))
);

-- ============================================================
-- 18. chi_tiet_hoa_don_dich_vu  -> hoa_don, dich_vu
-- ============================================================
CREATE TABLE chi_tiet_hoa_don_dich_vu (
    ma_hoa_don  CHAR(12)      NOT NULL,
    ma_dich_vu  CHAR(12)      NOT NULL,
    so_luong    NUMERIC(12,2) NOT NULL DEFAULT 1,
    don_gia     NUMERIC(12,2) NOT NULL,
    thanh_tien  NUMERIC(12,2) NOT NULL,
    ghi_chu     TEXT,
    CONSTRAINT pk_cthddv PRIMARY KEY (ma_hoa_don, ma_dich_vu),
    CONSTRAINT fk_cthddv_hoadon FOREIGN KEY (ma_hoa_don)
        REFERENCES hoa_don(ma_hoa_don) ON UPDATE CASCADE ON DELETE CASCADE,
    CONSTRAINT fk_cthddv_dichvu FOREIGN KEY (ma_dich_vu)
        REFERENCES dich_vu(ma_dich_vu) ON UPDATE CASCADE ON DELETE RESTRICT,
    CONSTRAINT chk_cthddv_soluong CHECK (so_luong > 0),
    CONSTRAINT chk_cthddv_dongia CHECK (don_gia >= 0),
    CONSTRAINT chk_cthddv_thanhtien CHECK (thanh_tien >= 0)
);

-- ============================================================
-- 19. nhat_ky_quan_tri  → tai_khoan (×2)
-- Ghi lại toàn bộ thao tác của System Admin lên tài khoản người dùng
-- UC: Quản trị người dùng
-- ============================================================
CREATE TABLE nhat_ky_quan_tri (
    ma_nk          CHAR(12)     NOT NULL,
    ma_nguoi_thuc  CHAR(12)     NOT NULL,  -- System Admin thực hiện
    ma_doi_tuong   CHAR(12),               -- tài khoản bị tác động (NULL nếu thao tác hệ thống)
    loai_hanh_dong VARCHAR(30)  NOT NULL,  -- tao_tk | sua_tk | xoa_tk | khoa_tk | cap_quyen | doi_mat_khau | cap_nhat_thamso | cap_nhat_phong | cap_nhat_giuong | cap_nhat_dichvu
    gia_tri_cu     TEXT,                   -- JSON snapshot trước khi thay đổi
    gia_tri_moi    TEXT,                   -- JSON snapshot sau khi thay đổi
    thoi_diem      TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    ghi_chu        TEXT,
    CONSTRAINT pk_nhat_ky_qt        PRIMARY KEY (ma_nk),
    CONSTRAINT fk_nkqt_nguoithuc    FOREIGN KEY (ma_nguoi_thuc)
        REFERENCES tai_khoan(ma_tai_khoan) ON UPDATE CASCADE ON DELETE RESTRICT,
    CONSTRAINT fk_nkqt_doituong     FOREIGN KEY (ma_doi_tuong)
        REFERENCES tai_khoan(ma_tai_khoan) ON UPDATE CASCADE ON DELETE SET NULL,
    CONSTRAINT chk_nkqt_hanhdong    CHECK (loai_hanh_dong IN (
        'tao_tk','sua_tk','xoa_tk','khoa_tk','mo_khoa_tk','cap_quyen',
        'doi_mat_khau','cap_nhat_thamso','cap_nhat_phong','cap_nhat_giuong','cap_nhat_dichvu'
    )),
);

-- ============================================================
-- 20. thong_bao  → tai_khoan (×2)
-- Ghi nhận thông báo nội bộ giữa các tài khoản trong hệ thống
-- Người gửi: System Admin / Quản lý / Sale / Kế toán / Hệ thống
-- Người nhận: bất kỳ tài khoản nào (nhân viên hoặc khách hàng)
-- ============================================================
CREATE TABLE thong_bao (
    ma_thong_bao   CHAR(12)     NOT NULL,
    ma_nguoi_gui   CHAR(12),               -- NULL = thông báo tự động từ hệ thống
    ma_nguoi_nhan  CHAR(12)     NOT NULL,
    tieu_de        VARCHAR(200) NOT NULL,
    noi_dung       TEXT         NOT NULL,
    CONSTRAINT pk_thong_bao      PRIMARY KEY (ma_thong_bao),
    CONSTRAINT fk_tb_nguoigui   FOREIGN KEY (ma_nguoi_gui)
        REFERENCES tai_khoan(ma_tai_khoan) ON UPDATE CASCADE ON DELETE SET NULL,
    CONSTRAINT fk_tb_nguoinhan  FOREIGN KEY (ma_nguoi_nhan)
        REFERENCES tai_khoan(ma_tai_khoan) ON UPDATE CASCADE ON DELETE CASCADE
);

-- ============================================================
-- FK muộn: phong.ma_nguoi_sua → tai_khoan
-- ============================================================
ALTER TABLE phong
    ADD CONSTRAINT fk_phong_nguoisua
        FOREIGN KEY (ma_nguoi_sua)
            REFERENCES tai_khoan(ma_tai_khoan) ON UPDATE CASCADE ON DELETE SET NULL;

-- ============================================================
-- FK muộn: giuong.ma_nguoi_sua → tai_khoan
-- ============================================================
ALTER TABLE giuong
    ADD CONSTRAINT fk_giuong_nguoisua
        FOREIGN KEY (ma_nguoi_sua)
            REFERENCES tai_khoan(ma_tai_khoan) ON UPDATE CASCADE ON DELETE SET NULL;

-- ============================================================
-- INDEX
-- ============================================================
CREATE INDEX idx_phong_cn         ON phong(ma_chi_nhanh, trang_thai);
CREATE INDEX idx_giuong_tt        ON giuong(trang_thai);
CREATE INDEX idx_giuong_phong     ON giuong(ma_phong);
CREATE INDEX idx_nv_vaitro        ON nhan_vien(vai_tro);
CREATE INDEX idx_taikhoan_vaitro  ON tai_khoan(ma_vai_tro, trang_thai);
CREATE INDEX idx_taikhoan_nv      ON tai_khoan(ma_nv);
CREATE INDEX idx_taikhoan_kh      ON tai_khoan(ma_kh);
-- Index hỗ trợ brute-force check & reset password
CREATE INDEX idx_taikhoan_reset   ON tai_khoan(reset_token_hash) WHERE reset_token_hash IS NOT NULL;
CREATE INDEX idx_thamso_nhom      ON tham_so_he_thong(nhom_tham_so, is_active);
CREATE INDEX idx_dichvu_loai      ON dich_vu(loai_dich_vu, is_active);
CREATE INDEX idx_hoso_kh          ON ho_so_dang_ky(ma_kh, trang_thai);
CREATE INDEX idx_coc_tt           ON phieu_dat_coc(trang_thai, han_thanh_toan);
CREATE INDEX idx_hopdong_kh       ON hop_dong_thue(ma_kh, trang_thai);
CREATE INDEX idx_hopdong_phong    ON hop_dong_thue(ma_phong, trang_thai);
CREATE INDEX idx_hoadon_kh        ON hoa_don(ma_kh, loai_hoa_don);
CREATE INDEX idx_hoadon_ky        ON hoa_don(ma_hop_dong, ky_thanh_toan);
CREATE INDEX idx_cthddv_dichvu    ON chi_tiet_hoa_don_dich_vu(ma_dich_vu);
-- Partial index: cọc sắp hết hạn
CREATE INDEX idx_coc_han          ON phieu_dat_coc(han_thanh_toan)
    WHERE trang_thai = 'cho_thanh_toan';
-- Index hỗ trợ tra cứu nhật ký quản trị
CREATE INDEX idx_nkqt_nguoithuc   ON nhat_ky_quan_tri(ma_nguoi_thuc, thoi_diem);
CREATE INDEX idx_nkqt_doituong    ON nhat_ky_quan_tri(ma_doi_tuong, thoi_diem);
CREATE INDEX idx_nkqt_hanhdong    ON nhat_ky_quan_tri(loai_hanh_dong, thoi_diem);
