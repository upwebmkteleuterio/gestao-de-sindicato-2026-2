# 🏛️ Espelho do Esquema Supabase - Gestão Sindical

## 📊 Tabelas

### `profiles`
| Coluna | Tipo | Descrição |
| :--- | :--- | :--- |
| `id` | UUID (PK) | Referência a `auth.users` |
| `role` | ENUM | `administrador`, `empresa`, `funcionario` |

### `companies`
| Coluna | Tipo | Descrição |
| :--- | :--- | :--- |
| `owner_id` | UUID (FK) | Vinculado ao Profile do criador |
| `status` | TEXT | `Incomplete` (padrão no cadastro) |

## ⚙️ Automações (Triggers)
- **`handle_new_user`**: Disparado no `INSERT` de `auth.users`.
  - Cria um `public.profiles`.
  - **Novo**: Se `role = empresa`, cria automaticamente um registro em `public.companies` usando os metadados do cadastro (CNPJ, Razão Social, etc).

---
*Última atualização: Automação de cadastro de empresa implementada.*